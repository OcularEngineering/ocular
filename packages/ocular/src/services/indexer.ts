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

  // Indexes a Batch of Docs To the Full Text Search + Vector Index and FileStorage.
  async indexDocuments(indexName: string, documents: IndexableDocument[]): Promise<void> {
    try {
      this.logger_.info(`Indexing ${documents.length} documents to index ${indexName}`)
      // Optionally Add Files To Content Store.
      // if (options.uploadToStorage) {
      //   // TODO: use separate containers for each index?
      //   await this.blobStorage.upload(filename, data, type);
      // }
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
