const glob = require("glob");
import { Express } from "express"
import fs from "fs"
import { sync as existsSync } from "fs-exists-cached"
import _ from "lodash"
import createRequireFromPath from "../utils/create-require-from-path"

import { EOL } from "os"
import path from "path"
import { AutoflowContainer } from "@ocular-ai/utils"
import { ConfigModule, Logger } from "../types"
import { promiseAll } from "../utils/promise-all"
import {
  formatRegistrationName,
} from "../utils/format-registration-name"
import { asValue, asFunction , Lifetime } from "awilix"
import { OauthService } from "../types/interfaces"
import { AppService } from "../services";

type Options = {
  rootDirectory: string
  container: AutoflowContainer
  configModule: ConfigModule
  app: Express
  activityId: string
}

type AppDetails = {
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
  const resolved = getResolvedApps(rootDirectory, configModule) || []
  
  await promiseAll(
    resolved.map(
      async (appDetails) => await runSetupFunctions(appDetails)
    )
  )

  await promiseAll(
    resolved.map(async (appDetails) => {
      registerRepositories(appDetails, container)
      await registerServices(appDetails, container)
      // await registerMedusaApi(appDetails, container)
      // registerApi(appDetails, app, rootDirectory, container, activityId)
      // registerCoreRouters(pluginDetails, container)
      registerSubscribers(appDetails, container)
    })
  )

  await Promise.all(
    resolved.map(async (appDetails) => runLoaders(appDetails, container))
  )


  // resolved.forEach((plugin) => trackInstallation(plugin.name, "plugin"))
  

  console.log("resolved", resolved)

}

function getResolvedApps(
  rootDirectory: string,
  configModule: ConfigModule,
  extensionDirectoryPath = "dist"
): undefined | AppDetails[] {
  const { apps } = configModule

  console.log("apps", apps)

  const resolved = apps.map((app) => {
    if (_.isString(app)) {
      return resolveApp(app)
    }

    const details = resolveApp(app.resolve)
    details.options = app.options

    return details
  })

  const extensionDirectory = path.join(rootDirectory, extensionDirectoryPath)
  // Resolve user's project as a app for loading purposes
  resolved.push({
    resolve: extensionDirectory,
    name: OCULAR_PROJECT_NAME,
    id: createAppId(OCULAR_PROJECT_NAME),
    options: configModule,
    version: createFileContentHash(process.cwd(), `**`),
  })

  return resolved
}

async function runLoaders(
  appDetails: AppDetails,
  container: AutoflowContainer
): Promise<void> {
  const loaderFiles = glob.sync(
    `${appDetails.resolve}/loaders/[!__]*.js`,
    {}
  )
  await Promise.all(
    loaderFiles.map(async (loader) => {
      try {
        const module = require(loader).default
        if (typeof module === "function") {
          await module(container, appDetails.options)
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
 * Registers an apps's repositories at the right location in our container.
 * repositories are registered directly in the container.
 * @param {object} appDetails - the app details including app options,
 *    version, id, resolved path, etc. See resolveApp
 * @param {object} container - the container where the services will be
 *    registered
 * @return {void}
 */
function registerRepositories(
  appDetails: AppDetails,
  container: AutoflowContainer
): void {
  const files = glob.sync(`${appDetails.resolve}/repositories/*.js`, {})
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
 * @param {object} appDetails - the app details including app options,
 *    version, id, resolved path, etc. See resolveApp
 * @param {object} container - the container where the services will be
 *    registered
 * @return {void}
 */
export async function registerServices(
  appDetails: AppDetails,
  container: AutoflowContainer
): Promise<void> {
  const files = glob.sync(`${appDetails.resolve}/services/[!__]*.js`, {})
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
        const registerAppDetails = loaded.getAppDetails(appDetails.options)


        // Self register the app on startup
        const appService =
           container.resolve("appService")
        await appService.registerAppOnStartUp(registerAppDetails)

        const name = registerAppDetails.name
        container.register({
          [`${name}Oauth`]: asFunction(
            (cradle) => new loaded(cradle, appDetails.options),
            {
              lifetime: Lifetime.SCOPED,
            }
          ),
        })
      }  else {
        container.register({
          [name]: asFunction(
            (cradle) => new loaded(cradle, appDetails.options),
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
 * Registers a app's subscribers at the right location in our container.
 * Subscribers are registered directly in the container.
 * @param {object} appDetails - the app details including app options,
 *    version, id, resolved path, etc. See resolveApp
 * @param {object} container - the container where the services will be
 *    registered
 * @return {void}
 */
function registerSubscribers(
  appDetails: AppDetails,
  container: AutoflowContainer
): void {
  const files = glob.sync(`${appDetails.resolve}/subscribers/*.js`, {})
  files.forEach((fn) => {
    const loaded = require(fn).default

    container.build(
      asFunction(
        (cradle) => new loaded(cradle, appDetails.options)
      ).singleton()
    )
  })
}

/**
 * Runs all setup functions in an app. Setup functions are run before anything from the app is
 * registered to the container. This is useful for running custom build logic, fetching remote
 * configurations, etc.
 * @param appDetails The app details including app options, version, id, resolved path, etc.
 */
async function runSetupFunctions(appDetails: AppDetails): Promise<void> {
  const files = glob.sync(`${appDetails.resolve}/setup/*.js`, {})
  await promiseAll(
    files.map(async (fn) => {
      const loaded = require(fn).default
      try {
        await loaded()
      } catch (err) {
        throw new Error(
          `A setup function from ${appDetails.name} failed. ${err}`
        )
      }
    })
  )
}

// TODO: Create unique id for each app
function createAppId(name: string): string {
  return name
}

/**
 * Finds the correct path for the app. If it is a local app it will be
 * found in the apps folder. Otherwise we will look for the app in the
 * installed npm packages.
 * @param {string} appName - the name of the app to find. Should match
 *    the name of the folder where the app is contained.
 * @return {object} the app details
 */
function resolveApp(appName: string): {
  resolve: string
  id: string
  name: string
  options: Record<string, unknown>
  version: string
} {
  // Only find apps when we're not given an absolute path
  if (!existsSync(appName)) {
    // Find the app in the local apps folder
    const resolvedPath = path.resolve(`../apps/${appName}`)

    if (existsSync(resolvedPath)) {
      if (existsSync(`${resolvedPath}/package.json`)) {
        const packageJSON = JSON.parse(
          fs.readFileSync(`${resolvedPath}/package.json`, `utf-8`)
        )
        const name = packageJSON.name || appName
        // warnOnIncompatiblePeerDependency(name, packageJSON)

        return {
          resolve: resolvedPath,
          name,
          id: createAppId(name),
          options: {},
          version:
            packageJSON.version || createFileContentHash(resolvedPath, `**`),
        }
      } else {
        // Make package.json a requirement for local apps too
        throw new Error(`App ${appName} requires a package.json file`)
      }
    }
  }

  const rootDir = path.resolve(".")

  /**
   *  Here we have an absolute path to an internal app, or a name of a module
   *  which should be located in node_modules.
   */
  try {
    const requireSource =
      rootDir !== null
        ? createRequireFromPath(`${rootDir}/:internal:`)
        : require
        // console.error("resolvedPath", re)
    // If the path is absolute, resolve the directory of the internal app,
    // otherwise resolve the directory containing the package.json
    const resolvedPath = path.dirname(
      requireSource.resolve(`${appName}/package.json`)
    )

   

    const packageJSON = JSON.parse(
      fs.readFileSync(`${resolvedPath}/package.json`, `utf-8`)
    )
    // warnOnIncompatiblePeerDependency(packageJSON.name, packageJSON)

    const computedResolvedPath =
      resolvedPath + (process.env.DEV_MODE ? "/src" : "")

    // Add support for a app to output the build into a dist directory
    const resolvedPathToDist = resolvedPath + "/dist"
    const isDistExist =
      resolvedPathToDist &&
      !process.env.DEV_MODE &&
      existsSync(resolvedPath + "/dist")

    return {
      resolve: isDistExist ? resolvedPathToDist : computedResolvedPath,
      id: createAppId(packageJSON.name),
      name: packageJSON.name,
      options: {},
      version: packageJSON.version,
    }
  } catch (err) {
    console.log("err", err)
    throw new Error(
      `Unable to find app "${appName}". Perhaps you need to install its package?`
    )
  }
}

function createFileContentHash(path, files): string {
  return path + files
}