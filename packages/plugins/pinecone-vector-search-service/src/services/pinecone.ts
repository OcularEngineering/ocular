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
        `deleteDocuments: Done Deleting Docs From Prinecone ${docIds.length}`
      );
    } catch (error) {
      this.logger_.error(
        `deleteDocuments: Error Deleting Docs From Pinecone ${error.message}`
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
        // metadata: doc.metadata,
        updatedAt: doc.updatedAt,
      },
      values: vectors,
    };
  };

  private pineconeMetadataFilter(context: SearchContext) {
    const filter = [];

    // Filter by source
    if (context.sources && context.sources.length > 0) {
      filter.push({
        source: { $in: [...context.sources] },
      });
    }

    // Filter by organisation_id
    if (context.organisation_id) {
      filter.push({
        organisationId: { $eq: context.organisation_id },
      });
    }

    // Filter by date
    // if (context.date) {
    //   if (context.date.from) {
    //     filter.push({
    //       updatedAt: { $gte: context.date.from },
    //     });
    //   }
    //   if (context.date.to) {
    //     filter.push({
    //       updatedAt: { $lte: context.date.to },
    //     });
    //   }
    // }

    // Filter by types
    if (context.types && context.types.length > 0) {
      filter.push({
        type: { $in: [...context.types] },
      });
    }

    const pineconeMetadataFilter = {
      $and: filter,
    };

    return pineconeMetadataFilter;
  }

  // This function returns a list of documents that match the search query. This is useful for the search service which cares about the document level search results.
  async searchDocuments(
    indexName: string,
    vector: number[],
    context?: SearchContext
  ): Promise<SearchResults> {
    try {
      // Construct Search Filters
      const filter = this.pineconeMetadataFilter(context);

      // Build a Search Query
      const query = {
        vector,
        topK: context?.top ? Number(context?.top) : 10,
        filter: filter,
        includeMetadata: true,
      };

      const index = this.pineconeClient_.index(indexName);
      const pineconeSearchResults = await index
        .namespace(PineconeNamespaceType.CONTENT)
        .query(query);

      const formattedSearchResults = this.formatPineconeSearchResults(
        pineconeSearchResults
      );

      return formattedSearchResults;
    } catch (error) {
      this.logger_.error(
        `searchDocuments: Error Searching Docs From Pinecone ${error.message}`
      );
    }
  }

  private formatPineconeSearchResults = (pineconeResults): SearchResults => {
    const hits: SearchDocument[] = pineconeResults.matches?.map((result) => {
      return {
        documentId: result.id,
        documentMetadata: result.metadata,
        snippets: [
          {
            score: result.score,
            content: result.metadata.content,
            updatedAt: result.metadata.updatedAt,
          },
        ],
      };
    });

    return {
      hits,
    };
  };

  async searchDocumentChunks(
    indexName: string,
    vector: number[],
    context?: SearchContext
  ): Promise<SearchChunk[]> {
    try {
      this.logger_.info("Search Chunks Called");
      // Construct Search Filters
      context.top = 3;
      const filter = this.pineconeMetadataFilter(context);

      // Build a Search Query
      const query = {
        vector,
        topK: context?.top ? Number(context?.top) : 10,
        filter: filter,
        includeMetadata: true,
      };

      const index = this.pineconeClient_.index(indexName);
      const pineconeSearchResults = await index
        .namespace(PineconeNamespaceType.CONTENT)
        .query(query);

      const chunks: SearchChunk[] = pineconeSearchResults.matches?.map(
        (result) => {
          return {
            score: Number(result.score),
            content: String(result.metadata.content),
            documentId: String(result.metadata.documentId),
            organisationId: String(result.metadata.organisationId),
            chunkId: Number(result.metadata.chunkId),
            type: result.metadata.type as DocType,
            source: String(result.metadata.source) as AppNameDefinitions,
            title: String(result.metadata.title),
            updatedAt: String(result.metadata.updatedAt),
          };
        }
      );
      this.logger_.info(`Search Chunks ${chunks}`);

      return chunks;
    } catch (error) {
      this.logger_.error(
        `searchDocumentChunks: Error Searching Docs From Pinecone ${error}`
      );
    }
  }
}
