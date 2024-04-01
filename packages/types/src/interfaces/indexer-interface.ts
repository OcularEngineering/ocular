import { IndexableDocument } from "../common"
import { TransactionBaseService } from "./transaction-base-service"

export interface IIndexerInterface {

  indexDocuments(indexName: string, documents: IndexableDocument[]): unknown
}