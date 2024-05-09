import {
  IndexableDocChunk,
  SearchChunk,
  SearchContext,
  SearchResults,
  SearchSnippet,
} from "../common";
export interface IVectorDB {
  createIndex(indexName: string): Promise<void>;
  addDocuments(indexName: string, doc: IndexableDocChunk[]): Promise<void>;
  searchDocuments(
    org_id: string,
    vector: number[],
    context?: SearchContext
  ): Promise<SearchResults>;
  searchDocumentChunks(
    indexName: string,
    vector: number[],
    context?: SearchContext
  ): Promise<SearchChunk[]>;
  deleteIndex(indexName: string): Promise<void>;
}

export abstract class AbstractVectorDBService implements IVectorDB {
  static _isVectorDBService = true;

  static isVectorDBService(obj) {
    return obj?.constructor?._isVectorDBService;
  }

  protected readonly options_: Record<string, unknown>;

  protected constructor(container, options) {
    this.options_ = options;
  }

  abstract createIndex(indexName: string): Promise<void>;
  abstract addDocuments(
    indexName: string,
    doc: IndexableDocChunk[]
  ): Promise<void>;
  abstract searchDocuments(
    org_id: string,
    vector: number[],
    context?: SearchContext
  ): Promise<SearchResults>;
  abstract searchDocumentChunks(
    indexName: string,
    vector: number[],
    context?: SearchContext
  ): Promise<SearchChunk[]>;
  abstract deleteIndex(indexName: string): Promise<void>;
}
