import { Router } from "express"
import middlewares, { transformQuery } from "../../../middlewares"
import { GetUserParams } from "./get-user"

export default (app) => {
  const route = Router()
  app.use("/users", route)
  route.post("/", middlewares.wrap(require("./create-user").default))
  
  route.get("/:id", 
    transformQuery(GetUserParams, {
    defaultRelations: defaultUserRelations,
    }),
   middlewares.wrap(require("./get-user").default)
  )

  return app
}

export const defaultUserRelations = []
export * from "./create-user"