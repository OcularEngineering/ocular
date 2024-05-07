import { AppNameDefinitions } from "../apps"
import { DocType } from "../common"

export interface CreateDocumentMetadataInput {
  link: string
  title: string
  type: DocType
  source: AppNameDefinitions
  organisationId: string
}