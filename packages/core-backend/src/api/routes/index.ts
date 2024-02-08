import { Router } from "express"
import authRoutes from "./auth"
import {unauthenticatedUserRoutes} from "./users"
import middlewares from "../middlewares"
import invites, { unauthenticatedInviteRoutes } from "./invites"
import apps from "./apps"
import components from "./components"
import search from "./search"
import teams from "./teams"
import organisation from "./organisation"

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
  teams(route)
  organisation(route)

  // users(route)
  return app
}