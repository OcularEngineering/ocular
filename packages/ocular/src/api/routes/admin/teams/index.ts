import "reflect-metadata"
import { GetTeamParams } from "./get-team"
import { GetTeamsParams } from "./list-teams"
import { Router } from "express"
import { Team } from "../../../../models"
import middlewares, { transformQuery } from "../../../middlewares"

const route = Router()
export default (app) => {
  app.use("/teams", route)
  route.post("/", middlewares.wrap(require("./create-team").default))
  
  route.get(
    "/",
    transformQuery(GetTeamsParams , {
      defaultRelations: defaultTeamsRelations,
      isList: true,
    }),
    middlewares.wrap(require("./list-teams").default)
  )
  
  const teamRouter = Router({ mergeParams: true })
  route.use("/:id", teamRouter)
  teamRouter.get(
    "/",
    transformQuery(GetTeamParams, {
      defaultRelations: defaultTeamRelations,
    }),
    middlewares.wrap(require("./get-team").default)
  )

  teamRouter.post(
    "/members",
    middlewares.wrap(require("./add-team-members").default)
  )

  teamRouter.delete(
    "/",
    middlewares.wrap(require("./delete-team").default)
  )

  teamRouter.delete(
    "/members",
    middlewares.wrap(require("./remove-team-members").default)
  )

  return app
}

export * from "./add-team-members"
export * from "./create-team"
export * from "./delete-team"
export * from "./get-team"
export * from "./list-teams"
export * from "./remove-team-members"

export const defaultTeamsRelations = []
export const defaultTeamRelations = []