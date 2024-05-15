import {
  IndexableDocument,
  AutoflowContainer,
  IIndexerInterface,
  IDocumentProcessorInterface,
  IVectorDB,
  IndexableDocChunk,
  Logger,
  ISearchService,
} from "@ocular/types";
import { SearchIndexClient, SearchIndex } from "@azure/search-documents";
import { ConfigModule } from "../types/config-module";
import { Document, Index } from "typeorm";
import { DocumentMetadataService, FileService } from "../services";
import { generateEmbedding } from "../utils";

export default class IndexerService implements IIndexerInterface {
  private config_: ConfigModule;
  protected readonly logger_: Logger;
  protected readonly documentProcessorService_: IDocumentProcessorInterface;
  protected readonly vectorDBService_: IVectorDB;
  protected readonly documentMetadataService_: DocumentMetadataService;
  protected readonly fileService_: FileService;
  protected readonly embedder_: any;

  constructor(container, config: ConfigModule) {
    this.config_ = config;
    this.logger_ = container.logger;
    this.documentProcessorService_ = container.documentProcessorService;
    this.vectorDBService_ = container.vectorDBService;
    this.documentMetadataService_ = container.documentMetadataService;
    this.fileService_ = container.fileService;
  }

  async createIndex(indexName: string) {
    try {
      await this.vectorDBService_.createIndex(indexName);
    } catch (err) {
      this.logger_.error(`Failed To Create ${indexName}`);
      throw err;
    }
  }

  async indexDocuments(
    indexName: string,
    documents: IndexableDocument[]
  ): Promise<void> {
    try {
      // Batch CreateOrUpdate DocumentMetadata in Database for the Docs
      // this.documentMetadataService_.batchCreateOrUpdateDocumentMetadata(documents)
      this.logger_.info(
        `Indexing ${documents.length} documents to index ${indexName}`
      );
      // Batch CreateOrUpdate DocumentMetadata in Database for the Docs
      // Create a DocumentMetadata if it does not exist else update the document metadata.
      const createdDocs =
        await this.documentMetadataService_.batchCreateOrUpdate(documents);
      const chunks =
        await this.documentProcessorService_.chunkIndexableDocumentsBatch(
          documents
        );
      const embeddedChunks = await this.embedChunks(chunks);
      console.log("Embedded Chunks Completed", embeddedChunks);
      await this.vectorDBService_.addDocuments(indexName, embeddedChunks);
    } catch (error) {
      this.logger_.error(`Error Indexing ${indexName}, error ${error.message}`);
    }
  }

  // Index Ocular API Documents
  async indexOcularApiDocuments(
    indexName: string,
    documents: IndexableDocument[]
  ): Promise<void> {
    try {
      this.logger_.info(
        `Indexing Ocular API Documents ${documents.length} documents to index ${indexName}`
      );
      console.log("Documents", documents.length);
      // Hydrate the api uploaded documents with the data from file service
      await Promise.all(
        documents.map(async (doc) => {
          const url: string = doc.metadata.url as string;
          const key: string = doc.metadata.key as string;
          const content = await this.fileService_.getFileDataAsTxt({
            fileKey: key,
          });

          doc.sections = [
            {
              link: url,
              content: content,
            },
          ];
        })
      );
      const chunks =
        await this.documentProcessorService_.chunkIndexableDocumentsBatch(
          documents
        );
      console.log("Chunks", chunks.length);
      const embeddedChunks = await this.embedChunks(chunks);
      console.log("Embedded Chunks Completed", embeddedChunks.length);
      await this.vectorDBService_.addDocuments(indexName, embeddedChunks);
    } catch (error) {
      this.logger_.error(`Error Indexing ${indexName}, error ${error.message}`);
    }
  }

  private async embedChunks(chunks: IndexableDocChunk[]) {
    const embeddedChunksPromises = chunks.map(async (chunk) => {
      if (chunk?.content) {
        chunk.contentEmbeddings = await generateEmbedding(chunk.content);
      }
      return chunk;
    });
    const embeddedChunks = await Promise.all(embeddedChunksPromises);
    return embeddedChunks;
  }
}
