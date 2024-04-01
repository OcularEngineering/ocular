import { IndexableDocChunk,SearchResult } from "../common"
export interface IVectorDB {
  createIndex(indexName:string): Promise<void>
  addDocuments(indexName:string, doc: IndexableDocChunk[]): Promise<void>
  searchDocuments(org_id: string, vector: number[], ): Promise<SearchResult>
  deleteIndex(indexName: string): Promise<void>
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

  abstract createIndex(indexName: string): Promise<void>;
  abstract addDocuments(indexName:string, doc: IndexableDocChunk[]): Promise<void>
  abstract searchDocuments(org_id: string, vector: number[], ): Promise<SearchResult>
  abstract deleteIndex(indexName: string): Promise<void>
}