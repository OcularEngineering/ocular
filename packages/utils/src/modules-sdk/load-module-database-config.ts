import { ModuleServiceInitializeOptions } from "@ocular-ai/types"
import  {AutoflowAiError, AutoflowAiErrorTypes } from "../common"

function getEnv(key: string, moduleName: string): string {
  const value =
    process.env[`${moduleName.toUpperCase()}_${key}`] ??
    process.env[`OCULAR_${key}`] ??
    process.env[`${key}`]
  return value ?? ""
}

function isModuleServiceInitializeOptions(
  obj: unknown
): obj is ModuleServiceInitializeOptions {
  return !!(obj as any)?.database
}

function getDefaultDriverOptions(clientUrl: string) {
  const localOptions = {
    connection: {
      ssl: false,
    },
  }

  const remoteOptions = {
    connection: {
      ssl: {
        rejectUnauthorized: false,
      },
    },
  }

  if (clientUrl) {
    return clientUrl.match(/localhost/i) ? localOptions : remoteOptions
  }

  return process.env.NODE_ENV?.match(/prod/i)
    ? remoteOptions
    : process.env.NODE_ENV?.match(/dev/i)
    ? localOptions
    : {}
}

/**
 * Load the config for the database connection. The options can be retrieved
 * e.g through PRODUCT_* (e.g PRODUCT_POSTGRES_URL) or * (e.g POSTGRES_URL) environment variables or the options object.
 * @param options
 * @param moduleName
 */
export function loadDatabaseConfig(
  moduleName: string,
  options?: ModuleServiceInitializeOptions,
  silent: boolean = false
): Pick<
  ModuleServiceInitializeOptions["database"],
  "clientUrl" | "schema" | "driverOptions" | "debug"
> {
  const clientUrl =
    options?.database?.clientUrl ?? getEnv("DATABASE_URL", moduleName)

  const database = {
    clientUrl,
    schema: getEnv("POSTGRES_SCHEMA", moduleName) ?? "public",
    driverOptions: JSON.parse(
      getEnv("POSTGRES_DRIVER_OPTIONS", moduleName) ||
        JSON.stringify(getDefaultDriverOptions(clientUrl))
    ),
    debug: false,
    connection: undefined,
  }

  if (!database.clientUrl && !silent && !database.connection) {
    throw new AutoflowAiError(
      AutoflowAiErrorTypes.INVALID_ARGUMENT,
      "No database clientUrl provided. Please provide the clientUrl through the [MODULE]_POSTGRES_URL, OCULAR_POSTGRES_URL or POSTGRES_URL environment variable or the options object in the initialize function."
    )
  }

  return database
}