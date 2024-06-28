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

enum PineconeNamespaceType {
  CONTENT = "content",
  TITLE = "title",
}

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

  async deleteDocuments(indexName: string, docIds: string[]) {
    try {
      this.logger_.info(
        `deleteDocuments: Deleting Docs From Pinecone ${docIds.length}`
      );

      const index = this.pineconeClient_.index(indexName);
      await index.namespace(PineconeNamespaceType.CONTENT).deleteMany(docIds);
      await index.namespace(PineconeNamespaceType.TITLE).deleteMany(docIds);

      this.logger_.info(
        `deleteDocuments: Done Deleting Docs From Quadrant ${docIds.length}`
      );
    } catch (error) {
      this.logger_.error(
        `deleteDocuments: Error Deleting Docs From Quadrant ${error.message}`
      );
    }
  }

  async addDocuments(indexName: string, docs: IndexableDocChunk[]) {
    try {
      this.logger_.info(
        `addDocuments: Adding Docs Chunks To Pinecone ${docs.length}`
      );
      // Split the docs into batches of 100
      const docBatches = [];
      for (let i = 0; i < docs.length; i += 100) {
        docBatches.push(docs.slice(i, i + 100));
      }
      // Process each batch

      for (const docBatch of docBatches) {
        const contentRecords = docBatch.map((doc) =>
          this.fomratIndexableDocToPineconeRecords(
            doc,
            PineconeNamespaceType.CONTENT
          )
        );
        const titleRecords = docBatch.map((doc) =>
          this.fomratIndexableDocToPineconeRecords(
            doc,
            PineconeNamespaceType.TITLE
          )
        );
        const index = this.pineconeClient_.index(indexName);
        await index.namespace("content").upsert(contentRecords);
        await index.namespace("title").upsert(titleRecords);
      }
      this.logger_.info(
        `addDocuments: Done Adding Doc Chunks To Pinecone ${docs.length}`
      );
    } catch (error) {
      this.logger_.error(
        `addDocuments: Error Adding Docs Chunks To Pinecone ${error.message}`
      );
    }
  }

  private createDocUUID(doc: IndexableDocChunk) {
    let name = `${doc.organisationId}-${doc.documentId}-${doc.chunkId}`;
    return uuidv5(name, this.UUIDHASH);
  }

  private fomratIndexableDocToPineconeRecords = (
    doc: IndexableDocChunk,
    namespace: string
  ) => {
    const vectors =
      namespace === PineconeNamespaceType.CONTENT
        ? doc.contentEmbeddings
        : doc.titleEmbeddings;
    return {
      id: this.createDocUUID(doc),
      metadata: {
        chunkId: doc.chunkId,
        organisationId: doc.organisationId,
        documentId: doc.documentId,
        title: doc.title,
        source: doc.source,
        type: doc.type,
        content: doc.content,
        chunkLinks: doc.chunkLinks,
        metadata: doc.metadata,
        updatedAt: doc.updatedAt,
      },
      values: vectors,
    };
  };

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
