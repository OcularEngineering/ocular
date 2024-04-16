import { formatRegistrationName } from "../utils/format-registration-name"
// import glob from "glob"
import path from "path"
import { ClassConstructor} from "../types/global"
import { AutoflowContainer } from "@ocular/types"
import { EntitySchema } from "typeorm"
import { asClass, asValue } from "awilix"
// Glob only works with require
const glob = require("glob");
const fg = require('fast-glob');

type ModelLoaderParams = {
  container: AutoflowContainer
  rootDirectory?: string
  corePathGlob?: string
  coreTestPathGlob?: string
}
/**
 * Registers all models in the model directory
 */
export default (
  {
    container,
    rootDirectory,
    corePathGlob = "../models/*.js",
  }: ModelLoaderParams,
  config = { register: true }
) => {
  const coreModelsFullGlob = path.join(__dirname, corePathGlob)
  const models: (ClassConstructor<unknown> | EntitySchema)[] = []

  const coreModels = glob.sync(coreModelsFullGlob, {
    cwd: __dirname,
    ignore: ["**/index.js", "**/index.ts", "**/index.js.map"],
  })
  
  coreModels.forEach((modelPath) => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const loaded = require(modelPath) as
      | ClassConstructor<unknown>
      | EntitySchema;

    if (loaded) {
      Object.entries(loaded).map(
        ([, val]: [string, ClassConstructor<unknown> | EntitySchema]) => {
          if (typeof val === "function" || val instanceof EntitySchema) {
            if (config.register) {
              const name = formatRegistrationName(modelPath)
              container.register({
                [name]: asClass(val as ClassConstructor<unknown>),
              })
              container.registerAdd("db_entities", asValue(val))
            }
            models.push(val)
          }
        }
      )
    }
  })
  return models
}
