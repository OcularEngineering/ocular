import { Router } from "express"
import { User } from "../../../models"
import middlewares from "../../middlewares"

const route = Router()

export default (app) => {
  app.use("/auth", route)

  route.post("/", middlewares.wrap(require("./create-session").default))

  route.get(
    "/",
    middlewares.authenticate(),
    middlewares.wrap(require("./get-session").default)
  )

  route.delete(
    "/",
    middlewares.authenticate(),
    middlewares.wrap(require("./delete-session").default)
  )

  return app
}

export type AdminAuthRes = {
  user: Omit<User, "password_hash">
}

export type AdminBearerAuthRes = {
  access_token: string
}

export * from "./create-session"
export * from "./get-session"
export * from "./delete-session"