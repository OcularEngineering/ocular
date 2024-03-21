import { IndexableDocument } from "../common"
import { TransactionBaseService } from "./transaction-base-service"

export interface IIndexerInterface {

  /**
   * Used to create an index
   * @param indexName the index name
   * @param options the options
   * @return returns response from search engine provider
   */
  createIndex(indexName: string, options?: unknown): unknown

  indexDocuments(indexName: string, documents: IndexableDocument[]): unknown
}