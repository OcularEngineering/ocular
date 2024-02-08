/* eslint-disable @typescript-eslint/no-var-requires */
import { Router } from "express"
import { Invite } from "../../../models/invite"
import middlewares from "../../middlewares"
import { transformQuery } from "../../middlewares/transform-query"
import { GetOrganisationParams } from "./get-organisation"
import "reflect-metadata"
import { Organisation } from "../../../models"


export default (app) => {
  const route = Router()
  app.use("/organisation", route)

  route.get(
    "/:id", 
    transformQuery(GetOrganisationParams, {
      defaultRelations: defaultOrganisationRelations,
      defaultFields: defaultOrganisationFields,
      isList: false,
    }),
    middlewares.wrap(require("./get-organisation").default)
    )
  

  return app
}

export * from "./get-organisation"

export const defaultOrganisationRelations = [
]


export const defaultOrganisationFields: (keyof Organisation)[] = [
  "id",
  "name",
  "created_at",
  "updated_at",
]