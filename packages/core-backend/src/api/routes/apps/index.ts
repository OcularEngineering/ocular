/* eslint-disable @typescript-eslint/no-var-requires */
import "reflect-metadata"
import { Router } from "express"
import middlewares, { transformQuery } from "../../middlewares"
import { App } from "../../../models"
import { GetAppParams } from "./get-app"

const route = Router()
export default (app) => {

  app.use("/apps", route)

  route.get(
    "/:id", 
    transformQuery(GetAppParams, {
      defaultRelations: defaultAppRelations,
      defaultFields: defaultAppFields,
      isList: false,
    }),
    middlewares.wrap(require("./get-app").default)
    )
  
    route.get(
      "/",
      transformQuery(GetAppParams, {
        defaultRelations: defaultAppRelations,
        defaultFields: defaultAppFields,
        isList: true,
      }),
      middlewares.wrap(require("./list-apps").default)
    )

  route.post(
    "/",
    middlewares.wrap(require("./create-app").default)
  )

  return app
}

export * from "./create-app"
export * from "./list-apps"

export const defaultAppRelations = [

]

export const defaultAppFields: (keyof App)[] = [
  "id",
  "name",
  "install_url",
  "uninstall_url",
  "created_at",
  "updated_at",
]