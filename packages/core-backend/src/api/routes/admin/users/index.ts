import { Router } from "express"
import middlewares from "../../../middlewares"

export default (app) => {
  const route = Router()
  app.use("/users", route)
  route.post("/", middlewares.wrap(require("./create-user").default))
  return app
}

export * from "./create-user"