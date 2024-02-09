/* eslint-disable @typescript-eslint/no-var-requires */
import { Router } from "express"
import { Invite } from "../../../../models/invite"
import middlewares from "../../../middlewares"
import "reflect-metadata"


export default (app) => {
  const route = Router()
  app.use("/invites", route)
  route.post("/accept", middlewares.wrap(require("./accept-invite").default))
  return app
}

export * from "./accept-invite"