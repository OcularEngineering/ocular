import CatalogService from "./services/catalog"
import { ModuleExports } from "@ocular-ai/types"

const service = CatalogService

export const moduleDefinition: ModuleExports = {
  service,
}