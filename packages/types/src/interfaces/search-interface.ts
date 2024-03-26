import { IndexableDocChunk } from "../common";

export interface SearchDocumentsResult {
  query: string;
  results:  IndexableDocChunk[];
  content: string;
}

export interface ISearchService {
    /**
     * Used to search for a document in an index
     * @param indexName the index name
     * @param query the search query
     * @param options
     * - any options passed to the request object other than the query and indexName
     * - additionalOptions contain any provider specific options
     * @return returns response from search engine provider
     */
    search(indexName: string, query: string | null, options: unknown):  Promise<SearchDocumentsResult>
}

export abstract class AbstractSearchService
  implements ISearchService
{
  static _isSearchService = true

  static isSearchService(obj) {
    return obj?.constructor?._isSearchService
  }

  abstract readonly isDefault
  protected readonly options_: Record<string, unknown>

  get options(): Record<string, unknown> {
    return this.options_
  }

  protected constructor(container, options) {
    this.options_ = options
  }

  abstract search(
    indexName: string,
    query: string | null,
    options: unknown
  ): Promise<SearchDocumentsResult>
}