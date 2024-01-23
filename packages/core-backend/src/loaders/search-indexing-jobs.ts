import { Logger, AutoflowContainer } from "../types/global"
import { ConfigModule }  from "../types/config-module"
import { CoreBackendOcular } from "../oculars/core-backend-ocular"

type Options = {
  container: AutoflowContainer
  configModule: ConfigModule
  logger: Logger
}

// Schedules jobs to build a search index.
async function scheduleIndexingJobs({
  container,
  configModule,
  logger,
}: Options): Promise<void> {

  console.log(container)

  const searchService =
    container.resolve("searchService")
  const userService = container.resolve("userService")

  // Oculars are responsible for gathering documents known to plugins. This
  // particular collator gathers entities from the software catalog.

  // Add Ocular to Index Core Backend Information
  searchService.addOcular({
    schedule: "0 0 * * *",
    factory:  CoreBackendOcular.fromConfig(configModule, { logger, userService  }),
  });

  // The scheduler controls when documents are gathered from collators and sent
  // to the search engine for indexing.
  // Emit an event to trigger the index building scheduler to run rather than do this here.
  await searchService.build();
}

export default scheduleIndexingJobs