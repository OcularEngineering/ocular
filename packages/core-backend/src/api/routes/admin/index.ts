import { Router } from "express"
import invites from "./invites"
import middlewares from "../../middlewares"
import users from "./users/index"
// import apps from "./apps"
// import components from "./member/components"
// import search from "./member/search"
import teams from "./teams"
import organisation from "./organisation"

export default (app, container, config) => {
  const route = Router()
  app.use("/admin",route)
  
  // Create User Routes Admin Routes
  users(route)

  // Authenticated routes
  route.use(middlewares.authenticateAdmin())
  route.use(middlewares.registeredLoggedinUser)

  // apps(route)
  // components(route)
  invites(route)
  // search(route)
  teams(route)
  organisation(route)

  // users(route)
  return app
}