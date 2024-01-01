import { Router } from "express"
import auth from "./auth"
import {unauthenticatedUserRoutes} from "./users"

const route = Router()

export default (app, container, config) => {
  app.use("/v1",route)
  
  // const adminCors = config.admin_cors || ""
  // route.use(
  //   cors({
  //     origin: parseCorsOrigins(adminCors),
  //     credentials: true,
  //   })
  // )

  // Unauthenticated routes
  auth(route)
  unauthenticatedUserRoutes(route)

  // 
  // users(route)
  return app
}