/* eslint-disable @typescript-eslint/no-var-requires */
import "reflect-metadata"
import { Router } from "express"
import middlewares,{ transformQuery } from "../../middlewares"
import { GetComponentParams } from "./get-component"
import { Component } from "../../../models"

export default (app) => {
  const route = Router()
  app.use("/component", route)

  route.post("/", middlewares.wrap(require("./create-component").default))
  
  route.get(
    "/:id", 
    transformQuery(GetComponentParams, {
      defaultRelations: defaultComponentRelations,
      defaultFields: defaultComponentFields,
      isList: false,
    }),
    middlewares.wrap(require("./get-component").default)
    )
  
    route.get(
      "/",
      transformQuery(GetComponentParams, {
        defaultRelations: defaultComponentRelations,
        defaultFields: defaultComponentFields,
        isList: true,
      }),
      middlewares.wrap(require("./list-components").default)
    )
  return app
}

export * from "./create-component"
export * from "./get-component"
export * from "./list-components"

export const defaultComponentRelations = [
  "organisation",
]


export const defaultComponentFields: (keyof Component)[] = [
  "id",
  "type",
  "name",
  "organisation_id",
  "description",
  "created_at",
  "updated_at",
]