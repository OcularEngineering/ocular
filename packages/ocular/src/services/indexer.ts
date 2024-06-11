import {
  IndexableDocument,
  AutoflowContainer,
  IIndexerInterface,
  IDocumentProcessorInterface,
  IVectorDB,
  IndexableDocChunk,
  Logger,
  ISearchService,
  IEmbedderInterface,
} from "@ocular/types";
import { ConfigModule } from "../types/config-module";
import { Document, Index } from "typeorm";
import { DocumentMetadataService, FileService } from "../services";

export default class IndexerService implements IIndexerInterface {
  private config_: ConfigModule;
  protected readonly documentProcessorService_: IDocumentProcessorInterface;
  protected readonly vectorDBService_: IVectorDB;
  protected readonly documentMetadataService_: DocumentMetadataService;
  protected readonly fileService_: FileService;
  protected readonly embedderService_: IEmbedderInterface;
  private logger_: Logger;

  constructor(container, config: ConfigModule) {
    this.config_ = config;
    this.documentProcessorService_ = container.documentProcessorService;
    this.vectorDBService_ = container.vectorDBService;
    this.documentMetadataService_ = container.documentMetadataService;
    this.fileService_ = container.fileService;
    this.embedderService_ = container.embeddingService;
    this.logger_ = container.logger;
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
      this.logger_.info(
        `indexDocuments: Indexing Apps Documents ${documents.length} documents in ${indexName}`
      );
      // Batch CreateOrUpdate DocumentMetadata in Database for the Docs
      // this.documentMetadataService_.batchCreateOrUpdateDocumentMetadata(documents)
      // Batch CreateOrUpdate DocumentMetadata in Database for the Docs
      // Create a DocumentMetadata if it does not exist else update the document metadata.
      const createdDocs =
        await this.documentMetadataService_.batchCreateOrUpdate(documents);
      const chunks =
        await this.documentProcessorService_.chunkIndexableDocumentsBatch(
          documents
        );
      const embeddedChunks = await this.embedChunks(chunks);
      // Delete Old Chunks Of Documents To Be Added To The Vector Database
      const documentIds = documents.map((doc) => doc.id);
      await this.vectorDBService_.deleteDocuments(indexName, documentIds);
      // Add The New Chunks To The Vector Database
      await this.vectorDBService_.addDocuments(indexName, embeddedChunks);
      this.logger_.info(
        `indexDocuments: Done Indexing Apps Documents ${documents.length} documents in ${indexName}`
      );
    } catch (error) {
      this.logger_.error(
        `indexDocuments: Error Indexing ${indexName}, error ${error.message}`
      );
    }
  }

  // Index Ocular API Documents
  async indexOcularApiDocuments(
    indexName: string,
    documents: IndexableDocument[]
  ): Promise<void> {
    try {
      this.logger_.info(
        `Indexing Api Documents ${documents.length} documents in ${indexName}`
      );
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
      const embeddedChunks = await this.embedChunks(chunks);
      await this.vectorDBService_.addDocuments(indexName, embeddedChunks);
      this.logger_.info(
        ` Done Indexing Api Documents  ${documents.length} documents in ${indexName}`
      );
    } catch (error) {
      this.logger_.error(
        `indexOcularApiDocuments: Error Indexing ${indexName}, error ${error.message}`
      );
    }
  }

  private async embedChunks(chunks: IndexableDocChunk[]) {
    // Split the chunks into batches of 100
    const chunkBatches = [];
    for (let i = 0; i < chunks.length; i += 25) {
      chunkBatches.push(chunks.slice(i, i + 25));
    }
    // Process each batch
    const embeddedChunksPromises = chunkBatches.map(async (chunkBatch) => {
      // Filter out chunks without content and get the content for each chunk
      const chunksWithContent = chunkBatch.filter((chunk) => chunk?.content);
      const contents = chunksWithContent.map((chunk) => chunk.content);

      // Create embeddings for all contents in the batch
      const embeddings = await this.embedderService_.createEmbeddings(contents);
      // Assign the embeddings back to the chunks
      for (let i = 0; i < chunksWithContent.length; i++) {
        chunksWithContent[i].contentEmbeddings = embeddings[i];
      }
      // Return the processed batch
      return chunksWithContent;
    });

    // Wait for all batches to be processed
    const embeddedChunksBatches = await Promise.all(embeddedChunksPromises);

    // Flatten the batches into a single array
    const embeddedChunks = [].concat(...embeddedChunksBatches);

    return embeddedChunks;
  }
}
