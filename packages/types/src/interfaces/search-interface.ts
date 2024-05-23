import {
  IndexableDocChunk,
  Message,
  SearchChunk,
  SearchContext,
  SearchDocument,
  SearchResults,
} from "../common";
export interface ISearchService {
  searchDocuments(
    indexName: string,
    query: string,
    context?: SearchContext
  ): Promise<SearchDocument[]>;
  searchChunks(
    indexName: string,
    query: string,
    context?: SearchContext
  ): Promise<SearchChunk[]>;
}

export abstract class AbstractSearchService implements ISearchService {
  static _isSearchService = true;

  static isSearchService(obj) {
    return obj?.constructor?._isSearchService;
  }

  abstract readonly isDefault;
  protected readonly options_: Record<string, unknown>;

  get options(): Record<string, unknown> {
    return this.options_;
  }

  protected constructor(container, options) {
    this.options_ = options;
  }
  abstract searchDocuments(
    indexName: string,
    query: string,
    context?: SearchContext
  ): Promise<SearchDocument[]>;
  abstract searchChunks(
    indexName: string,
    query: string,
    context?: SearchContext
  ): Promise<SearchChunk[]>;
}
