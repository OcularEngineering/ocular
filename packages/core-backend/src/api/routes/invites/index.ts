import { Router } from "express"
import { Invite } from "../../../models/invite"
import middlewares from "../../middlewares"
import "reflect-metadata"

export const unauthenticatedInviteRoutes = (app) => {
  const route = Router()
  app.use("/invites", route)

  route.post("/accept", middlewares.wrap(require("./accept-invite").default))
}

export default (app) => {
  const route = Router()
  app.use("/invites", route)

  route.post("/", middlewares.wrap(require("./create-invite").default))

  return app
}

export * from "./create-invite"