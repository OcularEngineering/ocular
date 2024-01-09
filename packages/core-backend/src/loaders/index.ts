

import configLoader from './config';


import { Express, NextFunction, Request, Response } from "express"

import databaseLoader, {dataSource} from "./database"
// dataSource
import { ContainerRegistrationKeys } from "../utils/container"
import { asValue } from "awilix"
import { createAutoflowContainer } from "../utils/autoflow-container"
import { EOL } from "os"
import { Connection } from "typeorm"
import { AutoflowContainer } from "../types/global"
import apiLoader from "./api"
import Logger from "./logger"

// import defaultsLoader from "./defaults"
import expressLoader from "./express"
import modelsLoader from "./models.js"
import modulesLoader from "./module"
import passportLoader from "./passport"
import repositoriesLoader from "./repositories"
// import searchIndexLoader from "./search-index"
import servicesLoader from "./services.js"
import redisLoader from './redis';

type Options = {
  directory: string
  expressApp: Express
}

export default async ({
  directory: rootDirectory,
  expressApp
}: Options): Promise<{
  container: AutoflowContainer 
  dbConnection: Connection
  app: Express
}> => {
  // Load and Register Config into Container
  const configModule = configLoader(rootDirectory)
  const container = createAutoflowContainer()
  container.register(
    ContainerRegistrationKeys.CONFIG_MODULE,
    asValue(configModule)
  )
 
  container.register({
    [ContainerRegistrationKeys.LOGGER]: asValue(Logger),
  })

  await redisLoader({ container, configModule, logger: Logger })

  const modelsActivity = Logger.activity(`Initializing models${EOL}`)
  modelsLoader({ container})
  const mAct = Logger.success(modelsActivity, "Models initialized") || {}

  const dbActivity = Logger.activity(`Initializing database${EOL}`)
  const dbConnection = await databaseLoader({
    container,
    configModule,
  })
  const dbAct = Logger.success(dbActivity, "Database initialized") || {}

  const repoActivity = Logger.activity(`Initializing repositories${EOL}`)
  repositoriesLoader({ container })
  const rAct = Logger.success(repoActivity, "Repositories initialized") || {}

  container.register({
    [ContainerRegistrationKeys.MANAGER]: asValue(dataSource.manager),
  })

  container.register("remoteQuery", asValue(null)) // ensure remoteQuery is always registered

  const servicesActivity = Logger.activity(`Initializing services${EOL}`)
  servicesLoader({ container, configModule})
  const servAct = Logger.success(servicesActivity, "Services initialized") || {}

  const modulesActivity = Logger.activity(`Initializing modules${EOL}`)
  modulesLoader({ container, configModule})
  const modAct = Logger.success(modulesActivity, "Modules initialized") || {}

  const expActivity = Logger.activity(`Initializing express${EOL}`)
  await expressLoader({ app: expressApp, configModule })
  await passportLoader({ app: expressApp, container, configModule })
  const exAct = Logger.success(expActivity, "Express intialized") || {}

  // Add the registered services to the request scope
  expressApp.use((req: Request, res: Response, next: NextFunction) => {
    container.register({ manager: asValue(dataSource.manager) })
    ;(req as any).scope = container.createScope()
    next()
  })

  const apiActivity = Logger.activity(`Initializing API${EOL}`)
  await apiLoader({ container, app: expressApp, configModule })
  const apiAct = Logger.success(apiActivity, "API initialized") || {}

  return {
    container,
    dbConnection,
    app: expressApp,
  }
}

