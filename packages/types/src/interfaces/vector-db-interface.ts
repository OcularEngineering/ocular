import { IndexableDocChunk } from "../common"
import { SearchResult } from "./search-interface"

export interface IVectorDB {
  addDocuments(indexName:string, doc: IndexableDocChunk[]): Promise<void>
  searchDocuments(org_id: string, vector: number[], ): Promise<SearchResult>
}


export abstract class AbstractVectorDBService
  implements IVectorDB
{
  static _isVectorDBService = true

  static isVectorDBService(obj) {
    return obj?.constructor?._isVectorDBService
  }

  protected readonly options_: Record<string, unknown>

  protected constructor(container, options) {
    this.options_ = options
  }

  abstract addDocuments(indexName:string, doc: IndexableDocChunk[]): Promise<void>
  abstract searchDocuments(org_id: string, vector: number[], ): Promise<SearchResult>
}