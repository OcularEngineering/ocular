import { IndexableDocument, AutoflowContainer,IIndexerInterface,  IDocumentProcessorInterface, ILLMInterface  } from "@ocular/types"
import { SearchIndexClient, SearchIndex} from "@azure/search-documents";
import { ConfigModule } from "../types/config-module"
import { Logger } from "@ocular/types";
import { IndexableDocChunk } from "@ocular/types";
import { IVectorDB } from "@ocular/types";
import { ISearchService } from "@ocular/types";
import { Document, Index } from "typeorm";
import { DocumentMetadataService } from "../services";

export default class IndexerService implements IIndexerInterface {
  private config_: ConfigModule
  protected readonly logger_: Logger
  protected readonly documentProcessorService_:  IDocumentProcessorInterface
  protected readonly openAiService_:  ILLMInterface
  protected readonly vectorDBService_ : IVectorDB
  protected readonly documentMetadataService_: DocumentMetadataService

  constructor(container, config: ConfigModule) {
    this.config_ = config
    this.logger_ = container.logger
    this.documentProcessorService_ = container.documentProcessorService
    this.openAiService_ = container.openAiService
    this.vectorDBService_ = container.vectorDBService
    this.documentMetadataService_ = container.documentMetadataService
  }

  async createIndex(indexName:string){
    try {
     await this.vectorDBService_.createIndex(indexName)
    } catch(err) {
      this.logger_.error(`Failed To Create ${indexName}`)
      throw err
    }
  }

  async indexDocuments(indexName: string, documents: IndexableDocument[]): Promise<void> {
    try {
      // Batch CreateOrUpdate DocumentMetadata in Database for the Docs
      // this.documentMetadataService_.batchCreateOrUpdateDocumentMetadata(documents)
      this.logger_.info(`Indexing ${documents.length} documents to index ${indexName}`)
      // Batch CreateOrUpdate DocumentMetadata in Database for the Docs
      // Create a DocumentMetadata if it does not exist else update the document metadata.
      const createdDocs = await this.documentMetadataService_.batchCreateOrUpdate(documents)
      const chunks = await this.documentProcessorService_.chunkIndexableDocumentsBatch(documents)
      const embeddedChunksPromises = await chunks.map((chunk) => this.embedChunk(chunk));
      const embeddedChunks = await Promise.all(embeddedChunksPromises);
      await this.vectorDBService_.addDocuments(indexName, embeddedChunks)
    } catch (error) {
      this.logger_.error(`Error Indexing ${indexName}, error ${error.message}`)
    }
  }

  private async embedChunk(chunk: IndexableDocChunk) {
    if(chunk?.title){
      const titleEmbeddings = await this.openAiService_.createEmbeddings(chunk.title)
      chunk.titleEmbeddings = titleEmbeddings
    }

    if(chunk?.content){
     chunk.contentEmbeddings= await this.openAiService_.createEmbeddings(chunk.content)
    }
    return chunk
  }
}
