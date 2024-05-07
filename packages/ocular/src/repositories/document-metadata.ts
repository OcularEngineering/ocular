import { DocumentMetadata } from "../models"
import { dataSource } from "../loaders/database"

export const DocumentMetadataRepository = dataSource.getRepository(DocumentMetadata)
export default DocumentMetadataRepository