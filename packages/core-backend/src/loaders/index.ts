

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

// import defaultsLoader from "./defaults"
import expressLoader from "./express"
import modelsLoader from "./models.js"
import passportLoader from "./passport"
import repositoriesLoader from "./repositories"
// import searchIndexLoader from "./search-index"
import servicesLoader from "./services.js"

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
  console.log("Initializing configModule")
  const configModule = configLoader(rootDirectory)
  const container = createAutoflowContainer()
  container.register(
    ContainerRegistrationKeys.CONFIG_MODULE,
    asValue(configModule)
  )
  console.log(`Config Module initialized ${EOL}`)

  console.log(`Initializing models`)
  modelsLoader({ container})
  console.log(`Models initialized${EOL}`)

  console.log(`Initializing database`)
  const dbConnection = await databaseLoader({
    container,
    configModule,
  })
  console.log(`Database initialized ${EOL}`)

  console.log(`Initializing repositories${EOL}`)
  repositoriesLoader({ container })
  console.log("Repositories initialized")

  container.register({
    [ContainerRegistrationKeys.MANAGER]: asValue(dataSource.manager),
  })

  container.register("remoteQuery", asValue(null)) // ensure remoteQuery is always registered

  console.log(`Initializing Services`)
  servicesLoader({ container, configModule})
  console.log(`Services initialized${EOL}`)


  console.log(`Initializing Express`)
  await expressLoader({ app: expressApp, configModule })
  await passportLoader({ app: expressApp, container, configModule })
  console.log(`Express Initialized${EOL}`)

  // Add the registered services to the request scope
  expressApp.use((req: Request, res: Response, next: NextFunction) => {
    container.register({ manager: asValue(dataSource.manager) })
    ;(req as any).scope = container.createScope()
    next()
  })

  console.log("Initializing API's")
  await apiLoader({ container, app: expressApp, configModule })
  console.log("API initialized")

  return {
    container,
    dbConnection,
    app: expressApp,
  }
}

