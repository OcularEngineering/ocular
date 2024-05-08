import {
  AbstractVectorDBService,
  IndexableDocument,
  IndexableDocChunk,
  SearchContext,
  DocType,
  SearchDocument,
  SearchResults,
} from "@ocular/types";
import { QdrantClient, Schemas } from "@qdrant/js-client-rest";
import { v5 as uuidv5 } from "uuid";

// interface SearchResults {
//   id: string | number;
//   version: number;
//   score: number;
//   payload?: Record<string, unknown> | { [key: string]: unknown; };
//   vector?: Record<string, unknown> | number[] | { [key: string]: number[] | { indices: number[]; values: number[]; }; };
//   shard_key?: number| string | Record<string, unknown>;
// }

export default class qdrantService extends AbstractVectorDBService {
  protected qdrantClient_: QdrantClient;
  protected embeddingSize_: number;
  protected UUIDHASH = "1b671a64-40d5-491e-99b0-da01ff1f3341";

  constructor(container, options) {
    super(container, options);
    const { quadrant_db_url, embedding_size } = options;

    if (!quadrant_db_url) {
      throw new Error("Please provide a valid search DB URL");
    }

    if (!embedding_size) {
      throw new Error("Please provide an embedding size");
    }
    this.embeddingSize_ = embedding_size;
    this.qdrantClient_ = new QdrantClient({ url: quadrant_db_url });
  }

  async createIndex(indexName: string) {
    try {
      const vectorCreationParams: Schemas["CollectionParams"] = {
        vectors: {
          title: { size: this.embeddingSize_, distance: "Cosine" },
          content: { size: this.embeddingSize_, distance: "Cosine" },
        },
      };
      await this.qdrantClient_.createCollection(
        indexName,
        vectorCreationParams
      );
    } catch (error) {
      if (error.statusText === "Conflict") {
        console.log(`Index ${indexName} already exists`);
      } else {
        console.error(error.status);
      }
    }
  }

  async addDocuments(indexName: string, docs: IndexableDocChunk[]) {
    try {
      const points = docs.map(this.translateIndexableDocToQuadrantPoint);
      await this.qdrantClient_.upsert(indexName, { points });
    } catch (error) {
      console.log("QDrant: Error Adding Docs", error);
    }
  }

  // This function returns a list of documents that match the search query. This is useful for the search service which cares about the document level search results.
  async searchDocuments(
    indexName: string,
    vector: number[],
    context?: SearchContext
  ): Promise<SearchResults> {
    try {
      // Construct Search Filters
      const filter = this.buildQdrantSearchFilter(context);

      // Build a Search Query
      const searches = {
        vector: {
          name: "content",
          vector: vector,
        },
        group_by: "documentId",
        group_size: 3,
        limit: context?.top ? Number(context?.top) : 10,
        filter: filter,
        with_payload: true,
      };

      const qdrantSearchResults = await this.qdrantClient_.searchPointGroups(
        indexName,
        searches
      );
      const formartedSearchResults =
        this.formatSearchResults(qdrantSearchResults);
      return formartedSearchResults;
    } catch (error) {
      console.log("Qdrant: Error Searching Docs From Quadrant", error);
    }
  }

  // This function returns a list of chunks that match the search query. Chunks can belong to the same document hence the results returned
  // can be multiple chunks from the same document. This is effiecient for chunk level search in case of the CoPilot which cares about the
  // chunk level search results.
  // searchChunks

  // This function returns a list of documents that match the search query. This is useful for the search service which cares about the document level search results.
  // async searchChunks(indexName: string, vector: number[], context?: SearchContext): Promise<IndexableDocChunk[]>{
  //   try {
  //     // Construct Search Filters
  //     const filter = this.buildQdrantSearchFilter(context);

  //     // Build a Batch Search Query to Search for bot the Content and Title Vectors.
  //     const searches = [
  //       {
  //         vector: {
  //           name: "title",
  //           vector: vector
  //         },
  //         limit: context?.top ? Number(context?.top) : 3,
  //         filter: filter,
  //         with_payload: true,
  //       },
  //       {
  //         vector: {
  //           name: "content",
  //           vector: vector
  //         },
  //         limit: context?.top ? Number(context?.top) : 3,
  //         filter: filter,
  //         with_payload: true,
  //       }
  //     ]

  //     // This is a batch search, so we get 2 arrays of results for both title and content vectors which will be combined below.
  //     const searchResults: SearchResults[][] = await this.qdrantClient_.searchBatch(indexName, {searches})

  //     const flattenedSearches = searchResults.flat();
  //     const uniqueSearchResults = flattenedSearches.reduce((acc, current) => {
  //       const x = acc.find(item => item.payload.documentId === current.payload.documentId && item.payload.chunkId === current.payload.chunkId);
  //       if (!x) {
  //         return acc.concat([current]);
  //       } else {
  //         return acc;
  //       }
  //     }, []).map(doc => {
  //       const payload = doc.payload as IndexableDocChunk;
  //       payload.updatedAt = new Date(payload.updatedAt);
  //       return payload;
  //     });

  //   return uniqueSearchResults
  //   }catch(error){
  //     console.log("Qdrant: Error Searching Docs From Quadrant",error)
  //   }
  // }

  async deleteIndex(indexName: string) {
    try {
      await this.qdrantClient_.deleteCollection(indexName);
    } catch (error) {
      console.log("Error Deleting Index ", error);
    }
  }

  private createDocUUID(doc: IndexableDocChunk) {
    let name = `${doc.organisationId}-${doc.documentId}-${doc.chunkId}`;
    return uuidv5(name, this.UUIDHASH);
  }

  private translateIndexableDocToQuadrantPoint = (doc: IndexableDocChunk) => {
    return {
      id: this.createDocUUID(doc),
      payload: {
        chunkId: doc.chunkId,
        organisationId: doc.organisationId,
        documentId: doc.documentId,
        title: doc.title,
        source: doc.source,
        content: doc.content,
        chunkLinks: doc.chunkLinks,
        metadata: doc.metadata,
        updatedAt: doc.updatedAt,
      },
      vector: {
        title: doc.titleEmbeddings,
        content: doc.contentEmbeddings,
      },
    };
  };

  private buildQdrantSearchFilter(
    context: SearchContext
  ): Record<string, unknown> {
    let filter = {
      must: [],
    };

    if (context?.sources && context.sources.length > 0) {
      filter.must.push({
        key: "source",
        match: {
          any: [...context.sources],
        },
      });
    }

    if (context?.organisation_id) {
      filter.must.push({
        key: "organisationId",
        match: {
          any: [context.organisation_id],
        },
      });
    }

    return filter;
  }

  private formatSearchResults = (qdrantSearchResults): SearchResults => {
    const hits: SearchDocument[] = [];
    for (const group of qdrantSearchResults.groups) {
      let searchHit = {
        documentId: group.id,
        snippets: [],
      };

      for (const hit of group.hits) {
        searchHit.snippets.push({
          score: hit.score,
          content: hit.payload.content,
        });
      }
      hits.push(searchHit);
    }
    return {
      hits: hits,
    };
  };
}
