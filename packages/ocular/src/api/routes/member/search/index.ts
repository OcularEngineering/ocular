import { Router } from "express"
import middlewares from "../../../middlewares"
import "reflect-metadata"

export default (app) => {
  const route = Router()
  app.use("/search", route)

  route.post("/", middlewares.wrap(require("./search").default))

  return app
}

export function ask(app) {
  const route = Router()
  app.use("/ask", route)
  route.post("/", middlewares.wrap(require("./ask").default))
  return app
}

export function chat(app) {
  const route = Router()
  app.use("/chat", route)
  route.post("/", middlewares.wrap(require("./chat").default))
  return app
}

export * from "./search"