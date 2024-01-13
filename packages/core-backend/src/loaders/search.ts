import {SearchService} from "../services"
import { ConfigModule, IEventBusService } from "../types"
import { AutoflowContainer } from "../utils/autoflow-container"

export const SEARCH_INDEX_EVENT = "SEARCH_INDEX_EVENT"

async function loadProductsIntoSearchEngine(
  container: AutoflowContainer
): Promise<void> {
  const eventBusService: IEventBusService = container.resolve("eventBusService")
  void eventBusService.emit(SEARCH_INDEX_EVENT, {}).catch((err) => {
    console.error(err)
    console.error(
      "Something went wrong while emitting the search indexing event."
    )
  })
}

type Options = {
  container: AutoflowContainer
  configModule: ConfigModule
}

export default async ({ container, configModule}: Options) => {
    const algoliaService: SearchService = container.resolve("searchService")

    const { settings } = configModule.projectConfig.search_options

    await Promise.all(
      Object.entries(settings || {}).map(async ([indexName, value]) => {
        return await algoliaService.updateSettings(indexName, value)
      })
    )
  await loadProductsIntoSearchEngine(container)
}