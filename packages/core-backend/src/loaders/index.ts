import { Express, NextFunction, Request, Response } from "express"

import databaseLoader, {dataSource} from "./database"
// 

import { ContainerRegistrationKeys } from "../utils/container"
import { asValue } from "awilix"
import { createAutoflowContainer } from "../utils/autoflow-container"
import { EOL } from "os"
import requestIp from "request-ip"
import { Connection } from "typeorm"
import { AutoflowContainer } from "../types/global"
// import apiLoader from "./api"
import loadConfig from "./config"
// import defaultsLoader from "./defaults"
// import expressLoader from "./express"
import Logger from "./logger"
import modelsLoader from "./models"
// import passportLoader from "./passport"
import repositoriesLoader from "./repositories"
// import searchIndexLoader from "./search-index"
import servicesLoader from "./services"

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
  const configModule = loadConfig(rootDirectory)

  const container = createAutoflowContainer()
  container.register(
    ContainerRegistrationKeys.CONFIG_MODULE,
    asValue(configModule)
  )

  // Add additional information to context of request
  expressApp.use((req: Request, res: Response, next: NextFunction) => {
    const ipAddress = requestIp.getClientIp(req) as string
    ;(req as any).request_context = {
      ip_address: ipAddress,
    }
    next()
  })

  container.register({
    [ContainerRegistrationKeys.LOGGER]: asValue(Logger)
  })

  const modelsActivity = Logger.activity(`Initializing models${EOL}`)
  modelsLoader({ container})
  Logger.success(modelsActivity, "Models initialized") || {}

  const dbActivity = Logger.activity(`Initializing database${EOL}`)
  const dbConnection = await databaseLoader({
    container,
    configModule,
  })
  Logger.success(dbActivity, "Database initialized") || {}

  const repoActivity = Logger.activity(`Initializing repositories${EOL}`)
  repositoriesLoader({ container })
  Logger.success(repoActivity, "Repositories initialized") || {}

  container.register({
    [ContainerRegistrationKeys.MANAGER]: asValue(dataSource.manager),
  })

  container.register("remoteQuery", asValue(null)) // ensure remoteQuery is always registered

  const servicesActivity = Logger.activity(`Initializing services${EOL}`)
  servicesLoader({ container, configModule, isTest })
  Logger.success(servicesActivity, "Services initialized") || {}


  // const expActivity = Logger.activity(`Initializing express${EOL}`)
  // await expressLoader({ app: expressApp, configModule })
  // await passportLoader({ app: expressApp, container, configModule })
  // Logger.success(expActivity, "Express intialized") || {}

  // // Add the registered services to the request scope
  // expressApp.use((req: Request, res: Response, next: NextFunction) => {
  //   container.register({ manager: asValue(dataSource.manager) })
  //   ;(req as any).scope = container.createScope()
  //   next()
  // })

  // const pluginsActivity = Logger.activity(`Initializing plugins${EOL}`)
  // await pluginsLoader({
  //   container,
  //   rootDirectory,
  //   configModule,
  //   app: expressApp,
  //   activityId: pluginsActivity,
  // })
  // Logger.success(pluginsActivity, "Plugins intialized") || {}

  // console.log("Initialized API's")
  // const apiActivity = Logger.activity(`Initializing API${EOL}`)
  // await apiLoader({ container, app: expressApp, configModule })
  // Logger.success(apiActivity, "API initialized") || {}

  // const defaultsActivity = Logger.activity(`Initializing defaults${EOL}`)
  // await defaultsLoader({ container })
  // Logger.success(defaultsActivity, "Defaults initialized") || {}

  // const searchActivity = Logger.activity(
  //   `Initializing search engine indexing${EOL}`
  // )
  // await searchIndexLoader({ container })
  // Logger.success(searchActivity, "Indexing event emitted") || {}

  return {
    container,
    dbConnection,
    app: expressApp,
  }
}
