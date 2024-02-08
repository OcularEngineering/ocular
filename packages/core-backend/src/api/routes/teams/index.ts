import "reflect-metadata"
import { Router } from "express"
import { Team } from "../../../.."
import middlewares, { transformQuery } from "../../middlewares"
import { GetTeamsParams } from "./list-teams"
import { GetTeamParams } from "./get-team"

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

  teamRouter.delete(
    "/",
    middlewares.wrap(require("./delete-team").default)
  )

  teamRouter.post(
    "/members",
    middlewares.wrap(require("./add-team-members").default)
  )
  teamRouter.delete(
    "/members",
    middlewares.wrap(require("./remove-team-members").default)
  )

  return app
}

export * from "./create-team"
export * from "./list-teams"

export const defaultTeamsRelations = []
export const defaultTeamRelations = ["members"]