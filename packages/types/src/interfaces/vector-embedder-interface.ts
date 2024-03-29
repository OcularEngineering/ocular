import { IndexableDocument } from "../common"
export interface IVectorEmbedderInterface {
  createEmbedding(IndexableDocument): Promise<unknown>
  createEmbeddingBatch(IndexableDocument): Promise<unknown>
}