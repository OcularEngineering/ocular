import { IndexSettings } from "./settings"

export type SearchOptions = {
  paginationOptions: Record<string, unknown>
  categoryFilter: string
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

export type AzureOpenAIOptions = {
  serviceName: string
  deploymentName: string
  apiKey: string
  apiVersion: string
  openAIModel: string
}