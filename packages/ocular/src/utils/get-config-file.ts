import { join } from "path"
import sysPath from "path"
import { sync as existsSync } from "fs-exists-cached"

/**
 * Attempts to resolve the config file in a given root directory.
 * @param {string} rootDir - the directory to find the config file in.
 * @param {string} configName - the name of the config file.
 * @return {object} an object containing the config module and its path as well as an error property if the config couldn't be loaded.
 */
function getConfigFile<TConfig = unknown>(
  rootDir: string,
  configName: string
): { configModule: TConfig; configFilePath: string; error?: any } {
  
  const configFilePath = ``
  let configModule
  let err

  try {
    const configPath = sysPath.join(rootDir, configName)
    if (existsSync(configPath)) {
      const resolved = sysPath.resolve(configPath)
      configModule = require(resolved)
    }
  } catch (e) {
    console.log(e)
    err = e
  }

  if (configModule && typeof configModule.default === "object") {
    configModule = configModule.default
  }

  return { configModule, configFilePath, error: err }
}

export default getConfigFile
