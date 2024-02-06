import { Router } from "express"
import middlewares from "../../middlewares"

export const unauthenticatedUserRoutes = (app) => {
  const route = Router()
  app.use("/users", route)
  route.post("/", middlewares.wrap(require("./create-user").default))
}

export default (app) => {
  const route = Router()
  app.use("/users", route)

  return app
}

export * from "./create-user"