import { IndexSettings } from "./settings"

export type SearchOptions = {
  paginationOptions: Record<string, unknown>
  filter: string
  additionalOptions: Record<string, unknown>
}

export type SearchEngineOptions = {
  apiKey: string
  endpoint: string
  batchSize: number
  /**
   * Index settings
   */
  settings?: {
    [key: string]: IndexSettings
  }
}
