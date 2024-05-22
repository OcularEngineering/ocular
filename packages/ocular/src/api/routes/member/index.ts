import { Router } from "express";

import auth from "./auth";
import middlewares from "../../middlewares";
// import apps from "./apps"
// import components from "./member/components"
import search from "./search";
import chat from "./chat";
import { ask } from "./search";
// import organisation from "./member/organisation"

export default (app, container, config) => {
  const route = Router();
  app.use("/", route);

  // Unauthenticated Routes
  auth(route);

  // Authenticated routes
  route.use(middlewares.authenticate());
  route.use(middlewares.registeredLoggedinUser);

  // // Authenticated routes
  // route.use(middlewares.authenticate())
  // route.use(middlewares.registeredLoggedinUser)

  // apps(route)
  // components(route)
  // invites(route)
  chat(route);
  search(route);
  ask(route);
  // organisation(route)

  // users(route)
  return app;
};
