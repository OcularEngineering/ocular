import {
  ExternalModuleDeclaration,
  InternalModuleDeclaration,
  LoadedModule,
  MODULE_RESOURCE_TYPE,
  MODULE_SCOPE,
  ModuleExports,
  ModuleResolution,
} from "@ocular-ai/types"
import {
  createAutoflowContainer,
  simpleHash,
  stringifyCircular,
} from "@ocular-ai/utils"
import { moduleLoader, registerOcularModule } from "./loaders"

import { asValue } from "awilix"
import { loadModuleMigrations } from "./loaders/utils"

const logger: any = {
  log: (a) => console.log(a),
  info: (a) => console.log(a),
  warn: (a) => console.warn(a),
  error: (a) => console.error(a),
}

declare global {
  interface OcularModule {
    getLoadedModules(
      aliases?: Map<string, string>
    ): { [key: string]: LoadedModule }[]
    getModuleInstance(moduleKey: string, alias?: string): LoadedModule
  }
}

type ModuleAlias = {
  key: string
  hash: string
  alias?: string
  main?: boolean
}

export class OcularModule {
  private static instances_: Map<string, any> = new Map()
  private static modules_: Map<string, ModuleAlias[]> = new Map()
  private static loading_: Map<string, Promise<any>> = new Map()

  public static getLoadedModules(
    aliases?: Map<string, string>
  ): { [key: string]: LoadedModule }[] {
    return [...OcularModule.modules_.entries()].map(([key]) => {
      if (aliases?.has(key)) {
        return OcularModule.getModuleInstance(key, aliases.get(key))
      }

      return OcularModule.getModuleInstance(key)
    })
  }

  public static clearInstances(): void {
    OcularModule.instances_.clear()
    OcularModule.modules_.clear()
  }

  public static isInstalled(moduleKey: string, alias?: string): boolean {
    if (alias) {
      return (
        OcularModule.modules_.has(moduleKey) &&
        OcularModule.modules_.get(moduleKey)!.some((m) => m.alias === alias)
      )
    }

    return OcularModule.modules_.has(moduleKey)
  }

  public static getModuleInstance(
    moduleKey: string,
    alias?: string
  ): any | undefined {
    if (!OcularModule.modules_.has(moduleKey)) {
      return
    }

    let mod
    const modules = OcularModule.modules_.get(moduleKey)!
    if (alias) {
      mod = modules.find((m) => m.alias === alias)

      return OcularModule.instances_.get(mod?.hash)
    }

    mod = modules.find((m) => m.main) ?? modules[0]

    return OcularModule.instances_.get(mod?.hash)
  }

  private static registerModule(
    moduleKey: string,
    loadedModule: ModuleAlias
  ): void {
    if (!OcularModule.modules_.has(moduleKey)) {
      OcularModule.modules_.set(moduleKey, [])
    }

    const modules = OcularModule.modules_.get(moduleKey)!

    if (modules.some((m) => m.alias === loadedModule.alias)) {
      throw new Error(
        `Module ${moduleKey} already registed as '${loadedModule.alias}'. Please choose a different alias.`
      )
    }

    if (loadedModule.main) {
      if (modules.some((m) => m.main)) {
        throw new Error(`Module ${moduleKey} already have a 'main' registered.`)
      }
    }

    modules.push(loadedModule)
    OcularModule.modules_.set(moduleKey, modules!)
  }

  public static async bootstrap<T>(
    moduleKey: string,
    defaultPath: string,
    declaration?: InternalModuleDeclaration | ExternalModuleDeclaration,
    moduleExports?: ModuleExports,
    injectedDependencies?: Record<string, any>
  ): Promise<{
    [key: string]: T
  }> {
    const hashKey = simpleHash(
      stringifyCircular({ moduleKey, defaultPath, declaration })
    )

    if (OcularModule.instances_.has(hashKey)) {
      return OcularModule.instances_.get(hashKey)
    }

    if (OcularModule.loading_.has(hashKey)) {
      return OcularModule.loading_.get(hashKey)
    }

    let finishLoading: any
    let errorLoading: any
    OcularModule.loading_.set(
      hashKey,
      new Promise((resolve, reject) => {
        finishLoading = resolve
        errorLoading = reject
      })
    )

    let modDeclaration =
      declaration ??
      ({} as InternalModuleDeclaration | ExternalModuleDeclaration)

    if (declaration?.scope !== MODULE_SCOPE.EXTERNAL) {
      modDeclaration = {
        scope: MODULE_SCOPE.INTERNAL,
        resources: MODULE_RESOURCE_TYPE.ISOLATED,
        resolve: defaultPath,
        options: declaration,
        alias: declaration?.alias,
        main: declaration?.main,
      }
    }

    const container = createAutoflowContainer()

    if (injectedDependencies) {
      for (const service in injectedDependencies) {
        container.register(service, asValue(injectedDependencies[service]))
      }
    }

    const moduleResolutions = registerOcularModule(
      moduleKey,
      modDeclaration!,
      moduleExports
    )

    try {
      await moduleLoader({
        container,
        moduleResolutions,
        logger,
      })
    } catch (err) {
      errorLoading(err)
      throw err
    }

    const services = {}

    for (const resolution of Object.values(
      moduleResolutions
    ) as ModuleResolution[]) {
      const keyName = resolution.definition.key
      const registrationName = resolution.definition.registrationName

      services[keyName] = container.resolve(registrationName)
      services[keyName].__definition = resolution.definition

      if (resolution.definition.isQueryable) {
        services[keyName].__joinerConfig = await services[
          keyName
        ].__joinerConfig()
      }

      OcularModule.registerModule(keyName, {
        key: keyName,
        hash: hashKey,
        alias: modDeclaration.alias ?? hashKey,
        main: !!modDeclaration.main,
      })
    }

    OcularModule.instances_.set(hashKey, services)
    finishLoading(services)
    OcularModule.loading_.delete(hashKey)

    return services
  }

  public static async migrateUp(
    moduleKey: string,
    modulePath: string,
    options?: Record<string, any>
  ): Promise<void> {
    const moduleResolutions = registerOcularModule(moduleKey, {
      scope: MODULE_SCOPE.INTERNAL,
      resources: MODULE_RESOURCE_TYPE.ISOLATED,
      resolve: modulePath,
      options,
    })

    for (const mod in moduleResolutions) {
      const [migrateUp] = await loadModuleMigrations(moduleResolutions[mod])

      if (typeof migrateUp === "function") {
        await migrateUp({
          options,
          logger,
        })
      }
    }
  }

  public static async migrateDown(
    moduleKey: string,
    modulePath: string,
    options?: Record<string, any>
  ): Promise<void> {
    const moduleResolutions = registerOcularModule(moduleKey, {
      scope: MODULE_SCOPE.INTERNAL,
      resources: MODULE_RESOURCE_TYPE.ISOLATED,
      resolve: modulePath,
      options,
    })

    for (const mod in moduleResolutions) {
      const [, migrateDown] = await loadModuleMigrations(moduleResolutions[mod])

      if (typeof migrateDown === "function") {
        await migrateDown({
          options,
          logger,
        })
      }
    }
  }
}

global.OcularModule ??= OcularModule
exports.OcularModule = global.OcularModule