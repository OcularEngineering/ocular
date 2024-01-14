import { Router } from "express"
import { Invite } from "../../../models/invite"
import middlewares from "../../middlewares"
import "reflect-metadata"

export default (app) => {
  const route = Router()
  app.use("/search", route)

  route.post("/", middlewares.wrap(require("./search").default))

  return app
}

export * from "./search"