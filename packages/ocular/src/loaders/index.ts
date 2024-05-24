import configLoader from "./config";

import { Express, NextFunction, Request, Response } from "express";

import databaseLoader, { dataSource } from "./database";
// dataSource
import { ContainerRegistrationKeys } from "@ocular/utils";
import { asValue } from "awilix";
import { createAutoflowContainer } from "@ocular/utils";
import { EOL } from "os";
import { Connection } from "typeorm";
import { AutoflowContainer } from "@ocular/types";
import apiLoader from "./api";
import Logger from "./logger";
import { track } from "ocular-telemetry";

// import defaultsLoader from "./defaults"
import appsLoader from "./apps";
import approachesLoader from "./approaches";
import expressLoader from "./express";
// import loadOcularApp from "./ocular-app"
import modelsLoader from "./models.js";
import modulesLoader from "./module";
import passportLoader from "./passport";
import pluginsLoader from "./plugins";
import repositoriesLoader from "./repositories";
import searchIndexLoader from "./search";
import servicesLoader from "./services.js";
import redisLoader from "./redis";
import kafkaLoader from "./kafka";
import subscribersLoader from "./subscribers";

type Options = {
  directory: string;
  expressApp: Express;
};

export default async ({
  directory: rootDirectory,
  expressApp,
}: Options): Promise<{
  container: AutoflowContainer;
  dbConnection: Connection;
  app: Express;
}> => {
  const configModule = configLoader(rootDirectory);
  const container = createAutoflowContainer();
  container.register(
    ContainerRegistrationKeys.CONFIG_MODULE,
    asValue(configModule)
  );

  container.register({
    [ContainerRegistrationKeys.LOGGER]: asValue(Logger),
    [ContainerRegistrationKeys.INDEX_NAME]: asValue("Ocular"),
  });

  await redisLoader({ container, configModule, logger: Logger });
  await kafkaLoader({ container, configModule, logger: Logger });

  const modelsActivity = Logger.activity(`Initializing models${EOL}`);

  track("MODELS_INIT_STARTED");
  modelsLoader({ container });
  const mAct = Logger.success(modelsActivity, "Models initialized") || {};
  track("MODELS_INIT_COMPLETED", { duration: mAct.duration });

  const dbActivity = Logger.activity(`Initializing database${EOL}`);
  track("DATABASE_INIT_STARTED");
  const dbConnection = await databaseLoader({
    container,
    configModule,
  });
  const dbAct = Logger.success(dbActivity, "Database initialized") || {};
  track("DATABASE_INIT_COMPLETED", { duration: dbAct.duration });

  const repoActivity = Logger.activity(`Initializing repositories${EOL}`);
  track("REPOSITORIES_INIT_STARTED");
  repositoriesLoader({ container });
  const rAct = Logger.success(repoActivity, "Repositories initialized") || {};
  track("REPOSITORIES_INIT_COMPLETED", { duration: rAct.duration });

  container.register({
    [ContainerRegistrationKeys.MANAGER]: asValue(dataSource.manager),
  });

  container.register("remoteQuery", asValue(null)); // ensure remoteQuery is always registered

  const servicesActivity = Logger.activity(`Initializing services${EOL}`);
  track("SERVICES_INIT_STARTED");
  servicesLoader({ container, configModule });
  const servAct =
    Logger.success(servicesActivity, "Services initialized") || {};
  track("SERVICES_INIT_COMPLETED", { duration: servAct.duration });

  const modulesActivity = Logger.activity(`Initializing modules${EOL}`);
  track("MODULES_INIT_STARTED");
  modulesLoader({ container, configModule });
  const modAct = Logger.success(modulesActivity, "Modules initialized") || {};
  track("MODULES_INIT_COMPLETED", { duration: modAct.duration });

  // const modsActivity = Logger.activity(`Initializing modules${EOL}`)
  // await moduleLoader({
  //   container,
  //   moduleResolutions: registerModules(configModule.modules),
  //   logger: Logger,
  // })
  // const modsAct = Logger.success(modsActivity, "Modules initialized") || {}

  const expActivity = Logger.activity(`Initializing express${EOL}`);
  track("EXPRESS_INIT_STARTED");
  await expressLoader({ app: expressApp, configModule });
  await passportLoader({ app: expressApp, container, configModule });
  const exAct = Logger.success(expActivity, "Express intialized") || {};
  track("EXPRESS_INIT_COMPLETED", { duration: exAct.duration });

  // Add the registered services to the request scope
  expressApp.use((req: Request, res: Response, next: NextFunction) => {
    container.register({ manager: asValue(dataSource.manager) });
    (req as any).scope = container.createScope();
    next();
  });

  const appsActivity = Logger.activity(`Initializing apps${EOL}`);
  track("APPS_INIT_STARTED");
  await appsLoader({
    container,
    rootDirectory,
    configModule,
    app: expressApp,
    activityId: appsActivity,
  });
  const aAct = Logger.success(appsActivity, "Apps intialized") || {};
  track("APPS_INIT_COMPLETED", { duration: aAct.duration });

  const pluginsActivity = Logger.activity(`Initializing plugins${EOL}`);
  track("PLUGINS_INIT_STARTED");
  await pluginsLoader({
    container,
    rootDirectory,
    configModule,
    app: expressApp,
    activityId: pluginsActivity,
  });
  const pAct = Logger.success(pluginsActivity, "Plugins intialized") || {};
  track("PLUGINS_INIT_COMPLETED", { duration: pAct.duration });

  const subActivity = Logger.activity(`Initializing subscribers${EOL}`);
  track("SUBSCRIBERS_INIT_STARTED");
  await subscribersLoader({ container });
  const subAct = Logger.success(subActivity, "Subscribers initialized") || {};
  track("SUBSCRIBERS_INIT_COMPLETED", { duration: subAct.duration });

  const searActivity = Logger.activity(`Initializing Search Engine${EOL}`);
  track("SEARCH_INDEX_INIT_STARTED");
  await searchIndexLoader({ container, configModule, logger: Logger });
  const searAct =
    Logger.success(searActivity, "Search Engine initialized") || {};
  track("SEARCH_INDEX_INIT_COMPLETED", { duration: searAct.duration });

  const approachesActivity = Logger.activity(`Initializing approaches${EOL}`);
  track("APPROACHES_INIT_STARTED");
  await approachesLoader({ container, configModule });
  const apprAct =
    Logger.success(approachesActivity, "Approaches initialized") || {};
  track("APPROACHES_INIT_COMPLETED", { duration: apprAct.duration });

  const apiActivity = Logger.activity(`Initializing API${EOL}`);
  track("API_INIT_STARTED");
  await apiLoader({ container, app: expressApp, configModule });
  const apiAct = Logger.success(apiActivity, "API initialized") || {};
  track("API_INIT_COMPLETED", { duration: apiAct.duration });

  return {
    container,
    dbConnection,
    app: expressApp,
  };
};
