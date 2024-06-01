/* eslint-disable @typescript-eslint/no-var-requires */
import "reflect-metadata";
import { Router } from "express";
import middlewares, { transformQuery } from "../../../middlewares";
import { App } from "../../../../models";
// import { GetAppParams } from "./get-app"

const route = Router();
export default (app) => {
  app.use("/apps", route);
  // route.get(
  //   "/:id",
  //   transformQuery(GetAppParams, {
  //     defaultRelations: defaultAppRelations,
  //     defaultFields: defaultAppFields,
  //     isList: false,
  //   }),
  //   middlewares.wrap(require("./get-app").default)
  //   )

  // route.post(
  //   "/authorize",
  //   middlewares.wrap(require("./authorize-app").default)
  // )

  route.get("/", middlewares.wrap(require("./list-apps").default));
  route.post("/getapp", middlewares.wrap(require("./get-app").default));
  route.post(
    "/authorize",
    middlewares.wrap(require("./authorize-app").default)
  );
  route.get(
    "/installed",
    middlewares.wrap(require("./list-installed-apps").default)
  );

  route.post("/updateapp", middlewares.wrap(require("./updateApp").default));
  return app;
};

export * from "./authorize-app";
// export * from "../organisation/install-app"
export * from "./list-apps";
