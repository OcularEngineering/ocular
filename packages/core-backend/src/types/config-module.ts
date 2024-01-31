import { RedisOptions } from "ioredis"
import { LoggerOptions } from "typeorm"
import { SearchEngineOptions } from "./search/options"
import { PineConePluginOptions } from "./search/pinecone"
import {
  ExternalModuleDeclaration,
  InternalModuleDeclaration,
} from "@ocular-ai/types"

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
  store_cors?: string
  admin_cors?: string
  search_engine_options?:SearchEngineOptions
  vector_search_options?: PineConePluginOptions
}

export type ConfigModule = {
  projectConfig: ProjectConfigOptions
  modules?: Record<
  string,
  | false
  | string
  | Partial<InternalModuleDeclaration | ExternalModuleDeclaration>
  >
}

export type PartialPick<T, K extends keyof T> = {
  [P in K]?: T[P]
}