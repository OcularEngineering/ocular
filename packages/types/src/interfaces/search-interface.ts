import { IndexableDocChunk, Message, SearchContext, SearchResult } from "../common";
export interface ISearchService {
    search(indexName: string, query: string, context?: SearchContext):  Promise<IndexableDocChunk[]>
    executeSearchApproach(q: string, context?: SearchContext ): Promise<SearchResult>
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
    query: string ,
    context?: SearchContext
  ): Promise<IndexableDocChunk[]>
  abstract executeSearchApproach(q: string, context?: SearchContext ): Promise<SearchResult>
}