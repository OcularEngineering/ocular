import "reflect-metadata"
import { Router } from "express"

import { Invite } from "../../../../models/invite"
import middlewares from "../../../middlewares"

export default (app) => {
  const route = Router()
  app.use("/invites", route)

  route.post("/", middlewares.wrap(require("./create-invite").default))
  route.get("/", middlewares.wrap(require("./list-invites").default))

  return app
}

export * from "./create-invite"
export * from "./list-invites"