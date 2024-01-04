import { Router } from "express"
import auth from "./auth"
import {unauthenticatedUserRoutes} from "./users"



export default (app, container, config) => {
  const route = Router()
  app.use("/v1",route)
  // const adminCors = config.admin_cors || ""
  // route.use(
  //   cors({
  //     origin: parseCorsOrigins(adminCors),
  //     credentials: true,
  //   })
  // )

  // Allows unathenticated requests to the /users endpoint for creating user signups
  unauthenticatedUserRoutes(route)

  // Unauthenticated routes
  // auth(route)


  // 
  // users(route)
  return app
}