import {
  AbstractSearchService,
  IndexableDocChunk,
  SearchContext,
  IVectorDB,
  ISearchService,
  ILLMInterface,
  ISearchApproach,
  SearchResults,
  SearchChunk,
  IEmbedderInterface,
} from "@ocular/types";
import {
  AzureOpenAIOptions,
  SearchEngineOptions,
  SearchOptions,
} from "../types/search/options";
import { ConfigModule, Logger } from "../types";
import { SearchIndexClient } from "@azure/search-documents";
import { parseBoolean, removeNewlines } from "@ocular/utils";
import DocumentMetadataService from "./document-metadata";

type InjectedDependencies = {
  searchIndexClient: SearchIndexClient;
  logger: Logger;
  indexName: string;
  embedderService: IEmbedderInterface;
  vectorDBService: IVectorDB;
  documentMetadataService: DocumentMetadataService;
};

class SearchService extends AbstractSearchService {
  isDefault = false;
  protected readonly config_: ConfigModule;
  protected readonly logger_: Logger;
  protected readonly defaultIndexName_: string;
  protected readonly vectorDBService_: IVectorDB;
  protected readonly documentMetadataService_: DocumentMetadataService;
  protected readonly embedderService_: IEmbedderInterface;

  constructor(container: InjectedDependencies, config) {
    super(container, config);
    this.logger_ = container.logger;
    this.vectorDBService_ = container.vectorDBService;
    this.defaultIndexName_ = container.indexName;
    this.documentMetadataService_ = container.documentMetadataService;
    this.embedderService_ = container.embedderService;
  }

  async search(
    indexName?: string,
    query?: string,
    context?: SearchContext
  ): Promise<SearchResults> {
    indexName = indexName ? indexName : this.defaultIndexName_;

    // Compute Embeddings For The Query
    const queryVector = await this.embedderService_.createEmbeddings([query!]);
    // Search the index for the query vector
    // Add Organisation ID to the context
    const searchResults: SearchResults =
      await this.vectorDBService_.searchDocuments(
        indexName,
        queryVector[0],
        context ? context : {}
      );

    // Get The Document Ids From The Search Results
    const docIds: string[] = searchResults.hits.map((hit) => hit.documentId);

    // Get The Document Metadata From The Document Ids
    const docMetadata = await this.documentMetadataService_.list(docIds);

    // Join The Document Metadata With The Search Results
    searchResults.hits = searchResults.hits.map((hit) => {
      const metadata = docMetadata.find((doc) => doc.id === hit.documentId);
      return { ...hit, documentMetadata: { ...metadata } };
    });

    // Retrieve Chunks Top Indipendent Chunks Irrespective of the Document
    if (context.retrieve_chunks) {
      searchResults.chat_completion = {};
      searchResults.chat_completion.citations =
        await this.vectorDBService_.searchDocumentChunks(
          indexName,
          queryVector[0],
          context
        );
    }
    console.log("Search Results", searchResults);
    return searchResults;
  }
}

export default SearchService;
