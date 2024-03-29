import { IndexableDocument, AutoflowContainer,IIndexerInterface,  IDocumentProcessorInterface ,IndexFields, semanticSearchProfile ,vectorSearchProfile, ILLMInterface  } from "@ocular/types"
import { SearchIndexClient, SearchIndex} from "@azure/search-documents";
import { ConfigModule } from "../types/config-module"
import { Logger } from "@ocular/types";
import { IndexableDocChunk } from "@ocular/types";
import { IVectorDB } from "@ocular/types";
import { ISearchService } from "@ocular/types";

export default class IndexerService implements IIndexerInterface {
  private config_: ConfigModule
  protected readonly logger_: Logger
  protected readonly documentProcessorService_:  IDocumentProcessorInterface
  protected readonly openAiService_:  ILLMInterface

  protected readonly vectorDBService_ : IVectorDB
  protected readonly searchIndexService_ : ISearchService

  constructor(container, config: ConfigModule) {
    this.config_ = config
    this.logger_ = container.logger
    this.documentProcessorService_ = container.documentProcessorService
    this.openAiService_ = container.openAiService

    this.vectorDBService_ = container.vectorDBService
    this.searchIndexService_ = container.searchIndexService
  }

  async createIndex(indexName: string, options?: unknown){
    this.logger_.info(`Creating index ${indexName}`)

    try{
      // Store Existing Indexes In Memory To Avoid Unnecessary Calls To The Azure API
      // const names: string[] = [];
      // for await (const index of indexNames) {
      //   names.push(index.name);
      // }


      // // Check if Index exists in the Search Service
      // if (!names.includes(indexName)) {
      //   this.logger_.info(` Create Search "${indexName}" Index`);
      //   const searchIndex: SearchIndex = {
      //     name: indexName,
      //     fields: IndexFields,
      //     vectorSearch: vectorSearchProfile,
      //     semanticSearch:semanticSearchProfile,
      //   }
      //   await this.searchIndexClient_.createIndex(searchIndex, options);
      // }
    } catch(error){
    this.logger_.error(`Error Creating Index ${indexName}, error ${error.message}`)
    }
  }

  async indexDocuments(indexName: string, documents: IndexableDocument[]): Promise<void> {
    try {
      this.logger_.info(`Indexing ${documents.length} documents to index ${indexName}`)
      // Optionally Add Indexable Document to a Blob Storage. Implement this in the future.
      const chunks = this.documentProcessorService_.chunkIndexableDocumentsBatch(documents)
      chunks.map((chunk) => this.embedChunk(chunk))
      await this.vectorDBService_.addDocuments(indexName, chunks)
      await this.searchIndexService_.addDocuments(indexName, chunks)
    } catch (error) {
      this.logger_.error(`Error Indexing ${indexName}, error ${error.message}`)
    }
  }

  private async embedChunk(chunk: IndexableDocChunk) {
    if(chunk?.title){
      chunk.titleVector = await this.openAiService_.createEmbeddings(chunk.title)
    }

    if(chunk?.content){
     chunk.contentVector = await this.openAiService_.createEmbeddings(chunk.content)
    }
    return chunk
  }
}
