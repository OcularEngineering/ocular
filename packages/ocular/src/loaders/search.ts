import { asValue } from "awilix"
import Redis from "ioredis"
import FakeRedis from "ioredis-mock"
import { EOL } from "os"
import { Logger, AutoflowContainer, AbstractSearchService } from "@ocular/types"
import { ConfigModule }  from "../types/config-module"
import { SearchEngineOptions } from "../types/search/options"
import { SearchIndexClient, AzureKeyCredential } from "@azure/search-documents";
import { EventBusService } from "../services"
import { AutoflowAiError } from "@ocular/utils"

export const SEARCH_INDEX_EVENT = "SEARCH_INDEX_EVENT"

type Options = {
  container: AutoflowContainer
  configModule: ConfigModule
  logger: Logger
}

// Loads a search client into the container for use by the indexer and the search engine.
async function searchIndexLoader({
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
    logger?.error(`An error occurred while connecting to Search Client: ${err}`)
    throw AutoflowAiError
    console.log(err)
  }

  container.register({
    searchIndexClient: asValue(searchIndexClient),
  })

  // Check if there is a SearchService registered in the container before we emit the 
  // event to trigger the Search Service Index build.
  const searchService = container.resolve<AbstractSearchService>("searchService")
  if (searchService.isDefault) {
    logger.warn(
      "No search engine provider was found: make sure to include a search plugin to enable searching"
    )
    return
  }

  const eventBusService: EventBusService = container.resolve("eventBusService")
  void eventBusService.emit(SEARCH_INDEX_EVENT, {}).catch((err) => {
    logger.error(
      `Something went wrong while emitting the search indexing event ${err}`
    )
  })
}

export default searchIndexLoader