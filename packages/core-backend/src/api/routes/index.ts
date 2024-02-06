import { Router } from "express"
import authRoutes from "./auth"
import {unauthenticatedUserRoutes} from "./users"
import middlewares from "../middlewares"
import invites, { unauthenticatedInviteRoutes } from "./invites"
import search from "./search"
import components from "./components"
import apps from "./apps"

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
  
  authRoutes(route)
  unauthenticatedUserRoutes(route)
  route.use(middlewares.registeredLoggedinUser)
  unauthenticatedInviteRoutes(route)

  // Authenticated routes
  route.use(middlewares.authenticate())
  route.use(middlewares.registeredLoggedinUser)

  apps(route)
  components(route)
  invites(route)
  search(route)
  

  
  // users(route)
  return app
}