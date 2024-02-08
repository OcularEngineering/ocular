import { ISearchService } from "./search-interface"
import { Writable } from "stream"

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

  abstract createIndex(indexName: string, options: unknown): unknown

  abstract getIndex(indexName: string): unknown

  abstract addDocuments(
    indexName: string,
    documents: unknown,
    type: string
  ): unknown

  abstract replaceDocuments(
    indexName: string,
    documents: unknown,
    type: string
  ): unknown

  abstract deleteDocument(
    indexName: string,
    document_id: string | number
  ): unknown

  abstract deleteAllDocuments(indexName: string): unknown

  abstract search(
    indexName: string,
    query: string | null,
    options: unknown
  ): unknown

  abstract updateSettings(indexName: string, settings: unknown): unknown
}