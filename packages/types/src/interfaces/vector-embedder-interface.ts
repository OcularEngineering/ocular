import { IndexableDocument } from "../common"
import { TransactionBaseService } from "./transaction-base-service"

export interface IVectorEmbedderInterface {
  createEmbedding(IndexableDocument): Promise<unknown>
  createEmbeddingBatch(IndexableDocument): Promise<unknown>
}