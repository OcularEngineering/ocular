import {
  InternalModuleDeclaration,
  LoaderOptions,
  MODULE_RESOURCE_TYPE,
  MODULE_SCOPE,
} from "@medusajs/modules-sdk"
import { DataSource, DataSourceOptions } from "typeorm"

import { MedusaError } from "@medusajs/utils"
import { asValue } from "awilix"
import * as InventoryModels from "../models"
import { InventoryServiceInitializeOptions } from "../types"

export default async (
  { options, container }: LoaderOptions,
  moduleDeclaration?: InternalModuleDeclaration
): Promise<void> => {
  if (
    moduleDeclaration?.scope === MODULE_SCOPE.INTERNAL &&
    moduleDeclaration.resources === MODULE_RESOURCE_TYPE.SHARED
  ) {
    return
  }

  const dbData =
    options?.database as InventoryServiceInitializeOptions["database"]

  if (!dbData) {
    throw new MedusaError(
      MedusaError.Types.INVALID_ARGUMENT,
      `Database config is not present at module config "options.database"`
    )
  }

  const entities = Object.values(InventoryModels)
  const dataSource = new DataSource({
    type: dbData.type,
    url: dbData.url,
    database: dbData.database,
    extra: dbData.extra || {},
    schema: dbData.schema,
    entities,
    logging: dbData.logging,
  } as DataSourceOptions)

  await dataSource.initialize()

  container.register({
    manager: asValue(dataSource.manager),
  })
}
