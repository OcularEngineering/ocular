import { IndexableDocChunk, Message, SearchContext } from "../common";
export interface ISearchService {
    addDocuments(indexName: string, documents: IndexableDocChunk[]);
    search(indexName: string, query: string, context?: SearchContext):  Promise<IndexableDocChunk[]>
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
  // abstract createIndex(indexName: string);
  abstract addDocuments(indexName: string, documents: IndexableDocChunk[]);
  abstract search(
    indexName: string,
    query: string ,
    context?: SearchContext
  ): Promise<IndexableDocChunk[]>
}