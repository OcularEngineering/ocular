import { Router } from "express"

import auth from "./auth"
import invites  from "./invites"
import middlewares from "../../middlewares"
// import apps from "./apps"
// import components from "./member/components"
import search from "./search"
import {ask} from "./search"
// import teams from "./member/teams"
// import organisation from "./member/organisation"

export default (app, container, config) => {
  const route = Router()
  app.use("/",route)

  // Unauthenticated Routes
  auth(route)
  invites(route)
 
  // Authenticated routes
  route.use(middlewares.authenticate())
  route.use(middlewares.registeredLoggedinUser)

  // // Authenticated routes
  // route.use(middlewares.authenticate())
  // route.use(middlewares.registeredLoggedinUser)

  // apps(route)
  // components(route)
  // invites(route)
  ask(route)
  search(route)
  // teams(route)
  // organisation(route)

  // users(route)
  return app
}