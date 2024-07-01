const glob = require("glob");
import e, { Express } from "express";
import fs from "fs";
import { sync as existsSync } from "fs-exists-cached";
import _ from "lodash";
import createRequireFromPath from "../utils/create-require-from-path";
import { aliasTo } from "awilix";
import { EOL } from "os";
import path from "path";
import { AutoflowContainer, promiseAll } from "@ocular/utils";
import { ConfigModule, Logger } from "../types";
import { formatRegistrationName } from "../utils/format-registration-name";
import { asValue, asFunction, Lifetime } from "awilix";
import { AppauthorizationService } from "@ocular/types";
import { pathByOS } from "@ocular/utils";
import { trackInstallation } from "ocular-telemetry";

import { error } from "console";
const fg = require("fast-glob");

type Options = {
  rootDirectory: string;
  container: AutoflowContainer;
  configModule: ConfigModule;
  app: Express;
  activityId: string;
};

type BotDetails = {
  resolve: string;
  name: string;
  id: string;
  options: Record<string, unknown>;
  version: string;
};

export const OCULAR_PROJECT_NAME = "ocular-core-app";

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
  const resolved = getResolvedBots(rootDirectory, configModule) || [];

  await promiseAll(
    resolved.map(async (BotDetails) => await runSetupFunctions(BotDetails))
  );
  await promiseAll(
    resolved.map(async (BotDetails) => {
      await registerServices(BotDetails, container);
    })
  );

  resolved.forEach((bot) => trackInstallation(bot.name, "bot"));
};

function getResolvedBots(
  rootDirectory: string,
  configModule: ConfigModule,
  extensionDirectoryPath = "dist"
): undefined | BotDetails[] {
  const { bots } = configModule;

  const resolved = bots.map((bot: BotDetails) => {
    if (_.isString(bot)) {
      return resolveApp(bot.resolve);
    }

    const details = resolveApp(bot.resolve);
    trackInstallation(details.name, "bot");
    details.options = bot.options;
    return details;
  });

  // const extensionDirectory = path.join(rootDirectory, extensionDirectoryPath)
  // // Resolve user's project as a app for loading purposes
  // resolved.push({
  //   resolve: extensionDirectory,
  //   name: OCULAR_PROJECT_NAME,
  //   id: createAppId(OCULAR_PROJECT_NAME),
  //   options: configModule,
  //   version: createFileContentHash(process.cwd(), `**`),
  // })

  return resolved;
}

/**
 * Registers a service at the right location in our container.
 * Names are camelCase formatted and namespaced by the folder i.e:
 * services/example-payments -> examplePaymentsService
 * @param {object} BotDetails - the app details including app options,
 *    version, id, resolved path, etc. See resolveApp
 * @param {object} container - the container where the services will be
 *    registered
 * @return {void}
 */
export async function registerServices(
  BotDetails: BotDetails,
  container: AutoflowContainer
): Promise<void> {
  const registerServicesGlob = pathByOS(`${BotDetails.resolve}/services/*.js`);
  const files = glob.sync(registerServicesGlob, {});
  await promiseAll(
    files.map(async (fn) => {
      const loaded = require(fn).default;
      const name = formatRegistrationName(fn);

      if (typeof loaded !== "function") {
        throw new Error(
          `Cannot register ${name}. Make sure to default export a service class in ${fn}`
        );
      }

      const instanceOfLoaded = new loaded(container, BotDetails.options);

      container.register({
        [name]: asFunction(() => instanceOfLoaded, {
          lifetime: loaded.LIFE_TIME || Lifetime.SCOPED,
        }),
      });
      // container.build(
      //   asFunction((cradle) => new loaded(cradle, BotDetails.options)).scoped()
      // );
    })
  );
}

/**
 * Runs all setup functions in an app. Setup functions are run before anything from the app is
 * registered to the container. This is useful for running custom build logic, fetching remote
 * configurations, etc.
 * @param BotDetails The app details including app options, version, id, resolved path, etc.
 */
async function runSetupFunctions(BotDetails: BotDetails): Promise<void> {
  const registerSubscribersGlob = pathByOS(`${BotDetails.resolve}/setup/*.js`);
  const files = glob.sync(registerSubscribersGlob, {});
  await promiseAll(
    files.map(async (fn) => {
      const loaded = require(fn).default;
      try {
        await loaded();
      } catch (err) {
        throw new Error(
          `A setup function from ${BotDetails.name} failed. ${err}`
        );
      }
    })
  );
}

// TODO: Create unique id for each app
function createAppId(name: string): string {
  return name;
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
  resolve: string;
  id: string;
  name: string;
  options: Record<string, unknown>;
  version: string;
} {
  // Only find apps when we're not given an absolute path
  if (!existsSync(appName)) {
    // Find the app in the local apps folder
    const resolvedPath = path.resolve(`../apps/${appName}`);

    if (existsSync(resolvedPath)) {
      if (existsSync(`${resolvedPath}/package.json`)) {
        const packageJSON = JSON.parse(
          fs.readFileSync(`${resolvedPath}/package.json`, `utf-8`)
        );
        const name = packageJSON.idenitifier || appName;
        // warnOnIncompatiblePeerDependency(name, packageJSON)

        return {
          resolve: resolvedPath,
          name,
          id: createAppId(name),
          options: {},
          version:
            packageJSON.version || createFileContentHash(resolvedPath, `**`),
        };
      } else {
        // Make package.json a requirement for local apps too
        throw new Error(`App ${appName} requires a package.json file`);
      }
    }
  }

  const rootDir = path.resolve(".");

  /**
   *  Here we have an absolute path to an internal app, or a name of a module
   *  which should be located in node_modules.
   */
  try {
    const requireSource =
      rootDir !== null
        ? createRequireFromPath(`${rootDir}/:internal:`)
        : require;
    // console.error("resolvedPath", re)
    // If the path is absolute, resolve the directory of the internal app,
    // otherwise resolve the directory containing the package.json
    const resolvedPath = path.dirname(
      requireSource.resolve(`${appName}/package.json`)
    );

    const packageJSON = JSON.parse(
      fs.readFileSync(`${resolvedPath}/package.json`, `utf-8`)
    );
    // warnOnIncompatiblePeerDependency(packageJSON.name, packageJSON)

    const computedResolvedPath =
      resolvedPath + (process.env.DEV_MODE ? "/src" : "");

    // Add support for a app to output the build into a dist directory
    const resolvedPathToDist = resolvedPath + "/dist";
    const isDistExist =
      resolvedPathToDist &&
      !process.env.DEV_MODE &&
      existsSync(resolvedPath + "/dist");

    return {
      resolve: isDistExist ? resolvedPathToDist : computedResolvedPath,
      id: createAppId(packageJSON.name),
      name: packageJSON.name,
      options: {},
      version: packageJSON.version,
    };
  } catch (err) {
    console.log("err", err);
    throw new Error(
      `Unable to find app "${appName}". Perhaps you need to install its package?`
    );
  }
}

function createFileContentHash(path, files): string {
  return path + files;
}
