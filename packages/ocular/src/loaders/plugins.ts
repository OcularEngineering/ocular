const glob = require("glob");
import { Express } from "express"
import fs from "fs"
import { sync as existsSync } from "fs-exists-cached"
import _ from "lodash"
import createRequireFromPath from "../utils/create-require-from-path"

import { EOL } from "os"
import path from "path"
import { AutoflowContainer } from "@ocular/utils"
import { ConfigModule, Logger } from "../types"
import { promiseAll } from "@ocular/utils"
import {
  formatRegistrationName,
} from "../utils/format-registration-name"
import {  aliasTo, asValue, asFunction , Lifetime } from "awilix"
import { AbstractNotificationService, OauthService } from "@ocular/types"
import { AbstractDocumentProcesserService, AbstractLLMService } from "@ocular/types";

type Options = {
  rootDirectory: string
  container: AutoflowContainer
  configModule: ConfigModule
  app: Express
  activityId: string
}

type PluginDetails = {
  resolve: string
  name: string
  id: string
  options: Record<string, unknown>
  version: string
}

export const isSearchEngineInstalledResolutionKey = "isSearchEngineInstalled"

export const OCULAR_PROJECT_NAME = "ocular-core-app"

/**
 * Registers all services in the services directory
 */
export default async ({
  rootDirectory,
  container,
  app,
  configModule,
  activityId,
}: Options): Promise<void> => {
  const resolved = getResolvedPlugins(rootDirectory, configModule) || []
  
  await promiseAll(
    resolved.map(
      async (pluginDetails) => await runSetupFunctions(pluginDetails)
    )
  )

  await promiseAll(
    resolved.map(async (pluginDetails) => {
      registerRepositories(pluginDetails, container)
      await registerServices(pluginDetails, container)
      // await registerMedusaApi(pluginDetails, container)
      // registerApi(pluginDetails, plugin, rootDirectory, container, activityId)
      // registerCoreRouters(pluginDetails, container)
      registerSubscribers(pluginDetails, container)
    })
  )

  await Promise.all(
    resolved.map(async (pluginDetails) => runLoaders(pluginDetails, container))
  )


  // resolved.forEach((plugin) => trackInstallation(plugin.name, "plugin"))
  

}

function getResolvedPlugins(
  rootDirectory: string,
  configModule: ConfigModule,
  extensionDirectoryPath = "dist/core-backend/src"
): undefined | PluginDetails[] {
  const { plugins } = configModule

  const resolved = plugins.map((plugin) => {
    if (_.isString(plugin)) {
      return resolvePlugin(plugin)
    }

    const details = resolvePlugin(plugin.resolve)
    details.options = plugin.options

    return details
  })

  // const extensionDirectory = path.join(rootDirectory, extensionDirectoryPath)
  // // Resolve user's project as a plugin for loading purposes
  // resolved.push({
  //   resolve: extensionDirectory,
  //   name: OCULAR_PROJECT_NAME,
  //   id: createPluginId(OCULAR_PROJECT_NAME),
  //   options: configModule,
  //   version: createFileContentHash(process.cwd(), `**`),
  // })

  return resolved
}

async function runLoaders(
  pluginDetails: PluginDetails,
  container: AutoflowContainer
): Promise<void> {
  const loaderFiles = glob.sync(
    `${pluginDetails.resolve}/loaders/[!__]*.js`,
    {}
  )
  await Promise.all(
    loaderFiles.map(async (loader) => {
      try {
        const module = require(loader).default
        if (typeof module === "function") {
          await module(container, pluginDetails.options)
        }
      } catch (err) {
        const logger = container.resolve<Logger>("logger")
        logger.warn(`Running loader failed: ${err.message}`)
        return Promise.resolve()
      }
    })
  )
}





/**
 * Registers an plugins's repositories at the right location in our container.
 * repositories are registered directly in the container.
 * @param {object} pluginDetails - the plugin details including plugin options,
 *    version, id, resolved path, etc. See resolvePlugin
 * @param {object} container - the container where the services will be
 *    registered
 * @return {void}
 */
function registerRepositories(
  pluginDetails: PluginDetails,
  container: AutoflowContainer
): void {
  const files = glob.sync(`${pluginDetails.resolve}/repositories/*.js`, {})
  files.forEach((fn) => {
    const loaded = require(fn)

    Object.entries(loaded).map(([, val]: [string, any]) => {
      if (typeof loaded === "object") {
        const name = formatRegistrationName(fn)
        container.register({
          [name]: asValue(val),
        })
      }
    })
  })
}

/**
 * Registers a service at the right location in our container.
 * Names are camelCase formatted and namespaced by the folder i.e:
 * services/example-payments -> examplePaymentsService
 * @param {object} pluginDetails - the plugin details including plugin options,
 *    version, id, resolved path, etc. See resolvePlugin
 * @param {object} container - the container where the services will be
 *    registered
 * @return {void}
 */
export async function registerServices(
  pluginDetails: PluginDetails,
  container: AutoflowContainer
): Promise<void> {
  const files = glob.sync(`${pluginDetails.resolve}/dist/services/[!__]*.js`, {})
  
  await promiseAll(
    files.map(async (fn) => {
      const loaded = require(fn).default
      const name = formatRegistrationName(fn)
      if (typeof loaded !== "function") {
        throw new Error(
          `Cannot register ${name}. Make sure to default export a service class in ${fn}`
        )
      }

      if (OauthService.isOauthService(loaded.prototype)) {
        const registerPluginDetails = loaded.getPluginDetails(pluginDetails.options)


        // Self register the plugin on startup
        const pluginService =
           container.resolve("pluginService")
        await pluginService.registerPluginOnStartUp(registerPluginDetails)

        const name = registerPluginDetails.name
        container.register({
          [`${name}Oauth`]: asFunction(
            (cradle) => new loaded(cradle, pluginDetails.options),
            {
              lifetime: Lifetime.SCOPED,
            }
          ),
        })
      } else if (
        AbstractNotificationService.isNotificationService(loaded.prototype)
      ) {
        container.registerAdd(
          "notificationProviders",
          asFunction((cradle) => new loaded(cradle, pluginDetails.options), {
            lifetime: loaded.LIFE_TIME || Lifetime.SINGLETON,
          })
        )

        // Add the service directly to the container in order to make simple
        // resolution if we already know which notification provider we need to use
        container.register({
          [name]: asFunction(
            (cradle) => new loaded(cradle, pluginDetails.options),
            {
              lifetime: loaded.LIFE_TIME || Lifetime.SINGLETON,
            }
          ),
          [`noti_${loaded.identifier}`]: aliasTo(name),
        })
      } else if (AbstractDocumentProcesserService.isDocumentProcessorService(loaded.prototype)) {
        container.register({
          [name]: asFunction(
            (cradle) => new loaded(cradle, pluginDetails.options),
            {
              lifetime: loaded.LIFE_TIME || Lifetime.SINGLETON,
            }
          ),
        })
      } else if (AbstractLLMService.isLLMService(loaded.prototype)){
        container.register({
          [name]: asFunction(
            (cradle) => new loaded(cradle, pluginDetails.options),
            {
              lifetime: loaded.LIFE_TIME || Lifetime.SINGLETON,
            }
          ),
        })
      } else {
        container.register({
          [name]: asFunction(
            (cradle) => new loaded(cradle, pluginDetails.options),
            {
              lifetime: loaded.LIFE_TIME || Lifetime.SCOPED,
            }
          ),
        })
      }
    })
  )
}

/**
 * Registers a plugin's subscribers at the right location in our container.
 * Subscribers are registered directly in the container.
 * @param {object} pluginDetails - the plugin details including plugin options,
 *    version, id, resolved path, etc. See resolvePlugin
 * @param {object} container - the container where the services will be
 *    registered
 * @return {void}
 */
function registerSubscribers(
  pluginDetails: PluginDetails,
  container: AutoflowContainer
): void {
  const files = glob.sync(`${pluginDetails.resolve}/dist/subscribers/*.js`, {})
  files.forEach((fn) => {
    const loaded = require(fn).default

    container.build(
      asFunction(
        (cradle) => new loaded(cradle, pluginDetails.options)
      ).singleton()
    )
  })
}

/**
 * Runs all setup functions in an plugin. Setup functions are run before anything from the plugin is
 * registered to the container. This is useful for running custom build logic, fetching remote
 * configurations, etc.
 * @param pluginDetails The plugin details including plugin options, version, id, resolved path, etc.
 */
async function runSetupFunctions(pluginDetails: PluginDetails): Promise<void> {
  const files = glob.sync(`${pluginDetails.resolve}/setup/*.js`, {})
  await promiseAll(
    files.map(async (fn) => {
      const loaded = require(fn).default
      try {
        await loaded()
      } catch (err) {
        throw new Error(
          `A setup function from ${pluginDetails.name} failed. ${err}`
        )
      }
    })
  )
}

// TODO: Create unique id for each plugin
function createPluginId(name: string): string {
  return name
}

/**
 * Finds the correct path for the plugin. If it is a local plugin it will be
 * found in the plugins folder. Otherwise we will look for the plugin in the
 * installed npm packages.
 * @param {string} pluginName - the name of the plugin to find. Should match
 *    the name of the folder where the plugin is contained.
 * @return {object} the plugin details
 */
function resolvePlugin(pluginName: string): {
  resolve: string
  id: string
  name: string
  options: Record<string, unknown>
  version: string
} {
  // Only find plugins when we're not given an absolute path
  if (!existsSync(pluginName)) {
    // Find the plugin in the local plugins folder
    const resolvedPath = path.resolve(`../plugins/${pluginName}`)

    if (existsSync(resolvedPath)) {
      if (existsSync(`${resolvedPath}/package.json`)) {
        const packageJSON = JSON.parse(
          fs.readFileSync(`${resolvedPath}/package.json`, `utf-8`)
        )
        const name = packageJSON.name || pluginName
        // warnOnIncompatiblePeerDependency(name, packageJSON)

        return {
          resolve: resolvedPath,
          name,
          id: createPluginId(name),
          options: {},
          version:
            packageJSON.version || createFileContentHash(resolvedPath, `**`),
        }
      } else {
        // Make package.json a requirement for local plugins too
        throw new Error(`Plugin ${pluginName} requires a package.json file`)
      }
    }
  }

  const rootDir = path.resolve(".")

  /**
   *  Here we have an absolute path to an internal plugin, or a name of a module
   *  which should be located in node_modules.
   */
  try {
    const requireSource =
      rootDir !== null
        ? createRequireFromPath(`${rootDir}/:internal:`)
        : require
        // console.error("resolvedPath", re)
    // If the path is absolute, resolve the directory of the internal plugin,
    // otherwise resolve the directory containing the package.json
    const resolvedPath = path.dirname(
      requireSource.resolve(`${pluginName}/package.json`)
    )

   

    const packageJSON = JSON.parse(
      fs.readFileSync(`${resolvedPath}/package.json`, `utf-8`)
    )
    // warnOnIncompatiblePeerDependency(packageJSON.name, packageJSON)

    const computedResolvedPath =
      resolvedPath + (process.env.DEV_MODE ? "/src" : "")

    // Add support for a plugin to output the build into a dist directory
    const resolvedPathToDist = resolvedPath + "/dist"
    const isDistExist =
      resolvedPathToDist &&
      !process.env.DEV_MODE &&
      existsSync(resolvedPath + "/dist")

    return {
      resolve: isDistExist ? resolvedPathToDist : computedResolvedPath,
      id: createPluginId(packageJSON.name),
      name: packageJSON.name,
      options: {},
      version: packageJSON.version,
    }
  } catch (err) {
    console.log("err", err)
    throw new Error(
      `Unable to find plugin "${pluginName}". Perhaps you need to install its package?`
    )
  }
}

function createFileContentHash(path, files): string {
  return path + files
}