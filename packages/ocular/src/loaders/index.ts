

import configLoader from './config';


import { Express, NextFunction, Request, Response } from "express"

import databaseLoader, {dataSource} from "./database"
// dataSource
import { ContainerRegistrationKeys } from "@ocular/utils"
import { asValue } from "awilix"
import { createAutoflowContainer } from "@ocular/utils"
import { EOL } from "os"
import { Connection } from "typeorm"
import { AutoflowContainer } from "@ocular/types"
import apiLoader from "./api"
import Logger from "./logger"

// import defaultsLoader from "./defaults"
import appsLoader from "./apps"
import approachesLoader from "./approaches"
import expressLoader from "./express"
// import loadOcularApp from "./ocular-app"
import modelsLoader from "./models.js"
import modulesLoader from "./module"
import passportLoader from "./passport"
import pluginsLoader from "./plugins"
import repositoriesLoader from "./repositories"
import searchIndexLoader from "./search"
import servicesLoader from "./services.js"
import redisLoader from './redis';
import subscribersLoader from "./subscribers"

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

  // const modsActivity = Logger.activity(`Initializing modules${EOL}`)
  // await moduleLoader({
  //   container,
  //   moduleResolutions: registerModules(configModule.modules),
  //   logger: Logger,
  // })
  // const modsAct = Logger.success(modsActivity, "Modules initialized") || {}


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

  const appsActivity = Logger.activity(`Initializing apps${EOL}`)
  await appsLoader({
    container,
    rootDirectory,
    configModule,
    app: expressApp,
    activityId: appsActivity,
  })
  const aAct = Logger.success(appsActivity, "Apps intialized") || {}

  const pluginsActivity = Logger.activity(`Initializing plugins${EOL}`)
  await pluginsLoader({
    container,
    rootDirectory,
    configModule,
    app: expressApp,
    activityId: pluginsActivity,
  })
  const pAct = Logger.success(pluginsActivity, "Plugins intialized") || {}

  const searActivity = Logger.activity(`Initializing Search Engine${EOL}`)
  await searchIndexLoader({container, configModule, logger: Logger})
  const searAct = Logger.success(searActivity, "Search Engine initialized") || {}


  const subActivity = Logger.activity(`Initializing subscribers${EOL}`)
  await subscribersLoader({ container })
  const subAct = Logger.success(subActivity, "Subscribers initialized") || {}

  const approachesActivity = Logger.activity(`Initializing approaches${EOL}`)
  await approachesLoader({ container, configModule })
  const apprAct = Logger.success(approachesActivity, "Approaches initialized") || {}


  const apiActivity = Logger.activity(`Initializing API${EOL}`)
  await apiLoader({ container, app: expressApp, configModule })
  const apiAct = Logger.success(apiActivity, "API initialized") || {}

  return {
    container,
    dbConnection,
    app: expressApp,
  }
}

