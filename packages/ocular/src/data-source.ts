/* eslint-disable @typescript-eslint/no-explicit-any */
import { asValue, createContainer } from "awilix";
import { DataSource, DataSourceOptions } from "typeorm";
import { fileURLToPath } from "url";
import { pathByOS } from "@ocular/utils";
import path, { dirname, join } from "path";
import configLoader from "./loaders/config";
import { createAutoflowContainer } from "@ocular/utils";
import databaseLoader from "./loaders/database";
import modelsLoader from "./loaders/models";
import getConfigFile from "./utils/get-config-file";
const glob = require("glob");
const fg = require("fast-glob");

const rootDirectory = path.resolve(`.`);

const getMigrations = (directory) => {
  const { configModule, error } = getConfigFile(
    directory,
    process.env.CONFIG_FILE
  );

  const migrationDirs = [];
  const corePackageMigrations = path.resolve(
    path.join(__dirname, "migrations")
  );

  migrationDirs.push(path.join(corePackageMigrations, "*.js"));

  const coreMigrations = migrationDirs.flatMap((dir) => {
    return glob.sync(pathByOS(dir));
  });

  const migrations = coreMigrations
    .map((file) => {
      const loaded = require(file);
      return Object.values(loaded);
    })
    .flat()
    .filter(Boolean);
  return migrations;
};

const getDataSource = async (directory) => {
  const configModule = configLoader(directory);
  const container = createAutoflowContainer();
  modelsLoader({ container });
  const coreMigrations: string[] = getMigrations(directory) as string[];

  return await databaseLoader({
    container,
    configModule,
    customOptions: {
      migrations: coreMigrations,
      logging: "all",
      generateMigration: true,
    },
  });
};

export default getDataSource(rootDirectory);
