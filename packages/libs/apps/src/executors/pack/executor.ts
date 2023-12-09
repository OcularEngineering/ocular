import { ExecutorContext } from '@nrwl/devkit';
import { PackExecutorSchema } from './schema';
import {join, basename} from 'path';
import {execute} from "@autoflow-ai/core";

export default async function runExecutor(
  options: PackExecutorSchema,
  context: ExecutorContext
) {

  console.log(`🚧 Packing ${context.projectName}...`);
  const projectOutputPath = context.workspace.projects[context.projectName].targets.build.options.outputPath;
  const appDir = join(context.root, projectOutputPath,'..');

  const appName = basename(projectOutputPath);
  const archive = join(appDir, `${appName}.zip`);

  await execute(`rm -rf ${archive} && cd ${appDir}  && zip -r -j ${archive} ${appName}/* && cd -`);

  return {
    success: true
  };
}
