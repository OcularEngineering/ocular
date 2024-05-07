import { Document } from "../models"
import { dataSource } from "../loaders/database"

export const DocumentRepository = dataSource.getRepository(Document)
export default DocumentRepository