import {
  MODULE_PACKAGE_NAMES,
  // MedusaApp,
  OcularAppOutput,
  // MedusaModule,
  Modules,
  ModulesDefinition,
} from "@ocular-ai/modules-sdk"
import {
  InternalModuleDeclaration,
  AutoflowContainer,
  ModuleDefinition,
} from "@ocular-ai/types"

import  {ConfigModule} from "../types/config-module"

import { ContainerRegistrationKeys, isObject } from "../utils"
import { asValue } from "awilix"

export function mergeDefaultModules(
  modulesConfig: ConfigModule["modules"]
) {
  const defaultModules = Object.values(ModulesDefinition).filter(
    (definition: ModuleDefinition) => {
      return !!definition.defaultPackage
    }
  )

  const configModules = { ...modulesConfig } ?? {}

  for (const defaultModule of defaultModules as ModuleDefinition[]) {
    configModules[defaultModule.key] ??= defaultModule.defaultModuleDeclaration
  }

  return configModules
}

export const loadMedusaApp = async (
  {
    configModule,
    container,
  }: {
    configModule: {
      modules?: ConfigModule["modules"]
      projectConfig: ConfigModule["projectConfig"]
    }
    container: AutoflowContainer
  },
  config = { registerInContainer: true }
): Promise<OcularAppOutput> => {

  const sharedResourcesConfig = {
    database: {
      clientUrl: configModule.projectConfig.database_url,
      driverOptions: configModule.projectConfig.database_extra,
    },
  }

  const configModules = mergeDefaultModules(configModule.modules)

  // Apply default options to legacy modules
  for (const moduleKey of Object.keys(configModules)) {
    if (!ModulesDefinition[moduleKey].isLegacy) {
      continue
    }

    if (isObject(configModules[moduleKey])) {
      ;(
        configModules[moduleKey] as Partial<InternalModuleDeclaration>
      ).options ??= {
        database: {
          type: "postgres",
          url: configModule.projectConfig.database_url,
          extra: configModule.projectConfig.database_extra,
          schema: configModule.projectConfig.database_schema,
          logging: configModule.projectConfig.database_logging,
        },
      }
    }
  }

  // const medusaApp = await MedusaApp({
  //   modulesConfig: configModules,
  //   servicesConfig: joinerConfig,
  //   remoteFetchData: remoteQueryFetchData(container),
  //   sharedContainer: container,
  //   sharedResourcesConfig,
  //   injectedDependencies:{},
  // })

  // const requiredModuleKeys = [Modules.CATALOG]

  // const missingPackages: string[] = []

  // for (const requiredModuleKey of requiredModuleKeys) {
  //   const isModuleInstalled = MedusaModule.isInstalled(requiredModuleKey)
  //   if (!isModuleInstalled) {
  //     missingPackages.push(
  //       MODULE_PACKAGE_NAMES[requiredModuleKey] || requiredModuleKey
  //     )
  //   }
  // }

  // if (missingPackages.length) {
  //   throw new Error(
  //     `Ocular AI requires the following packages/module registration: (${missingPackages.join(
  //       ", "
  //     )})`
  //   )
  // }


  // if (!config.registerInContainer) {
  //   return medusaApp
  // }

  // container.register("remoteLink", asValue(medusaApp.link))
  // container.register(
  //   ContainerRegistrationKeys.REMOTE_QUERY,
  //   asValue(medusaApp.query)
  // )

  // for (const [serviceKey, moduleService] of Object.entries(medusaApp.modules)) {
  //   container.register(
  //     ModulesDefinition[serviceKey].registrationName,
  //     asValue(moduleService)
  //   )
  // }

  // // Register all unresolved modules as undefined to be present in the container with undefined value by defaul
  // // but still resolvable
  // for (const [, moduleDefinition] of Object.entries(ModulesDefinition)) {
  //   if (!container.hasRegistration(moduleDefinition.registrationName)) {
  //     container.register(moduleDefinition.registrationName, asValue(undefined))
  //   }
  // }

  // return medusaApp
  return null
}

export default loadMedusaApp