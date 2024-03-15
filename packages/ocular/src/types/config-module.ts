import { RedisOptions } from "ioredis"
import { LoggerOptions } from "typeorm"
import { SearchEngineOptions,AzureOpenAIOptions  } from "./search/options"

type SessionOptions = {
  name?: string
  resave?: boolean
  rolling?: boolean
  saveUninitialized?: boolean
  secret?: string
  ttl?: number
}

export type HttpCompressionOptions = {
  enabled?: boolean
  level?: number
  memLevel?: number
  threshold?: number | string
}

export type ProjectConfigOptions = {
  redis_url?: string
  redis_prefix?: string
  redis_options?: RedisOptions

  session_options?: SessionOptions

  jwt_secret?: string
  cookie_secret?: string

  database_url?: string
  database_database?: string
  database_schema?: string
  database_logging: LoggerOptions

  // @deprecated - only postgres is supported, so this config has no effect
  database_type?: string

  http_compression?: HttpCompressionOptions

  database_extra?: Record<string, unknown> & {
    ssl: { rejectUnauthorized: false }
  }
  ui_cors?: string
  client_id?: string
  github_client_secret?: string
  search_engine_options?:SearchEngineOptions
  azure_open_ai_options?: AzureOpenAIOptions 
}

export type ConfigModule = {
  projectConfig: ProjectConfigOptions
    /**
   * On your Ocular Core backend, you can use Apps to add allow the backend to interact with external services for Users. 
   * For example, installing an app such as GitHub allows Users get their GitHub into the CoreBackend.
   * 
   * Apps can be passed in using the `apps` array defined in `core-config.js`.
   * 
   * The items in the array is:
   * 
   * - An object having the following properties:
   *     - `resolve`: The name of the plugin.
   *     - `options`: An object that includes the plugin’s options. These options vary for each plugin, and you should refer to the plugin’s documentation for available options.
   * 
   * @example
   * ```js title="core-config.js"
   * module.exports = {
   *   plugins: [
   *     `app-1`,
   *     {
   *       resolve: `core-my-app`,
   *       options: {
   *         apiKey: process.env.MY_API_KEY || 
   *           `test`,
   *       },
   *     },
   *     // ...
   *   ],
   *   // ...
   * }
   * ```
   */
  apps?: (
    | {
        resolve: string
        options: Record<string, unknown>
      }
    | string
  )[],
  plugins?: (
    | {
        resolve: string
        options: Record<string, unknown>
      }
    | string
  )[],
}

export type PartialPick<T, K extends keyof T> = {
  [P in K]?: T[P]
}