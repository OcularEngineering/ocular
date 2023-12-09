import {
  names,
  Tree,
  readProjectConfiguration,
  updateProjectConfiguration
} from '@nx/devkit';
import { Schema } from './schema';
import { remoteGenerator } from '@nx/react';
import { runTasksInSerial } from "@nx/devkit"

export function normalizeDirectory(options: Schema) {
  return options.directory
    ? `${names(options.directory).fileName}/${names(options.name).fileName}`
    : names(options.name).fileName;
}

export function normalizeProjectName(options: Schema) {
  return normalizeDirectory(options).replace(new RegExp('/', 'g'), '-');
}

export default async function (tree: Tree, schema: Schema) {

  const remoteTask = await remoteGenerator(tree, schema);
  
  const appName = normalizeProjectName(schema);
  const appConfig = readProjectConfiguration(tree, appName);
  appConfig.targets['pack'] = {
    executor: '@autoflow-ai/apps:publish' 
  };
  appConfig.targets['publish'] = {
    executor: '@autoflow-ai/apps:publish' 
  };
  updateProjectConfiguration(tree, appName, {...appConfig});
  
  return runTasksInSerial(remoteTask);
}