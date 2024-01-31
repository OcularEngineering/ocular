import {
  MODULE_RESOURCE_TYPE,
  MODULE_SCOPE,
  ModuleDefinition,
} from "@ocular-ai/types"

import { upperCaseFirst } from "@ocular-ai/utils"

export enum Modules {
  CATALOG = "catalog",
}

export enum ModuleRegistrationName {
  CATALOG = "catalogService",
  EVENT_BUS= "eventBus",
}

export const MODULE_PACKAGE_NAMES = {
  [Modules.CATALOG]: "@ocular-ai/catalog",
}

export const ModulesDefinition: { [key: string | Modules]: ModuleDefinition } =
  {
    [Modules.CATALOG]: {
      key: Modules.CATALOG,
      registrationName: ModuleRegistrationName.CATALOG,
      defaultPackage: false,
      label: upperCaseFirst(ModuleRegistrationName.CATALOG),
      isRequired: false,
      canOverride: true,
      isQueryable: true,
      dependencies: ["logger"],
      defaultModuleDeclaration: {
        scope: MODULE_SCOPE.INTERNAL,
        resources: MODULE_RESOURCE_TYPE.SHARED,
      },
    },
  }

export const MODULE_DEFINITIONS: ModuleDefinition[] =
  Object.values(ModulesDefinition)

export default MODULE_DEFINITIONS