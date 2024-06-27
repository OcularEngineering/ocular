import {
  AbstractVectorDBService,
  IndexableDocument,
  IndexableDocChunk,
  SearchContext,
  DocType,
  SearchDocument,
  SearchResults,
  SearchChunk,
  AppNameDefinitions,
  Logger,
} from "@ocular/types";
import { v5 as uuidv5 } from "uuid";
import { IndexList, Pinecone } from "@pinecone-database/pinecone";

export default class PineconeService extends AbstractVectorDBService {
  protected pineconeClient_: Pinecone;
  protected embeddingSize_: number;
  protected logger_: Logger;
  protected UUIDHASH = "1b671a64-40d5-491e-99b0-da01ff1f3341";

  constructor(container, options) {
    super(container, options);
    const { pinecone_api_token, embedding_size } = options;

    if (!pinecone_api_token) {
      throw new Error("Please provide a Pinecone API token");
    }

    if (!embedding_size) {
      throw new Error("Please provide an embedding size");
    }
    this.embeddingSize_ = embedding_size;
    this.pineconeClient_ = new Pinecone({ apiKey: pinecone_api_token });
    this.logger_ = container.logger;
  }

  async createIndex(indexName: string) {
    try {
      // Check if the index already exists
      const existingIndexes: IndexList =
        await this.pineconeClient_.listIndexes();
      if (
        existingIndexes.indexes &&
        existingIndexes.indexes.some((index) => index.name === indexName)
      ) {
        console.log(`Index ${indexName} already exists`);
        return;
      }
      await this.pineconeClient_.createIndex({
        name: indexName,
        dimension: 1536,
        metric: "cosine",
        spec: {
          serverless: {
            cloud: "aws",
            region: "us-east-1",
          },
        },
      });
    } catch (error) {
      this.logger_.error(
        `createIndex: Error Creating Index ${indexName} ${error}`
      );
    }
  }

  async deleteIndex(indexName: string) {
    try {
      await this.pineconeClient_.deleteIndex(indexName);
    } catch (error) {
      this.logger_.error(`deleteIndex: Error Deleting Index ${indexName}`);
    }
  }

  addDocuments(indexName: string, doc: IndexableDocChunk[]): Promise<void> {
    throw new Error("Method not implemented.");
  }
  deleteDocuments(indexName: string, docIds: string[]): Promise<void> {
    throw new Error("Method not implemented.");
  }
  searchDocuments(
    org_id: string,
    vector: number[],
    context?: SearchContext
  ): Promise<SearchResults> {
    throw new Error("Method not implemented.");
  }
  searchDocumentChunks(
    indexName: string,
    vector: number[],
    context?: SearchContext
  ): Promise<SearchChunk[]> {
    throw new Error("Method not implemented.");
  }
}
