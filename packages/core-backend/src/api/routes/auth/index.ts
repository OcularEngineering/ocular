import { Router } from "express"
import { User } from "../../../models"
import middlewares from "../../middlewares"

const route = Router()

export default (app) => {
  app.use("/auth", route)

  route.post("/", middlewares.wrap(require("./create-session").default))

  return app
}

export type AdminAuthRes = {
  user: Omit<User, "password_hash">
}

export type AdminBearerAuthRes = {
  access_token: string
}

export * from "./create-session"