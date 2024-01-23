import { asValue } from "awilix"
import Redis from "ioredis"
import FakeRedis from "ioredis-mock"
import { EOL } from "os"
import { Logger, AutoflowContainer } from "../types/global"
import { ConfigModule }  from "../types/config-module"
import { SearchEngineOptions } from "../types/search/options"
import { SearchIndexClient, AzureKeyCredential } from "@azure/search-documents";

type Options = {
  container: AutoflowContainer
  configModule: ConfigModule
  logger: Logger
}

// Loads a search client into the container for use by the indexer and the search engine.
async function searchLoader({
  container,
  configModule,
  logger,
}: Options): Promise<void> {

  const { apiKey, endpoint } = configModule.projectConfig.search_engine_options as SearchEngineOptions

  if (!apiKey) {
    throw new Error("Please provide a valid search apiKey")
  }

  if (!endpoint) {
    throw new Error("Please provide a valid search Endpoint")
  }

  const searchIndexClient = new SearchIndexClient(endpoint, new AzureKeyCredential(apiKey));

  try {
    await searchIndexClient.getServiceStatistics()
    logger?.info(`Connection to Search Client established`)
  } catch (err) {
    logger?.error(`An error occurred while connecting to Search Client:${EOL} ${err}`)
  }

  container.register({
    searchIndexClient: asValue(searchIndexClient),
  })
}

export default searchLoader