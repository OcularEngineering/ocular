import { IndexableDocument } from "../common"
import { TransactionBaseService } from "./transaction-base-service"

export interface IIndexerInterface {
  createIndex(indexName:string)
  indexDocuments(indexName: string, documents: IndexableDocument[]): unknown
}