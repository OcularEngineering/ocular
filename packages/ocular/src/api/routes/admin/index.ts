import { Router } from "express";
import middlewares from "../../middlewares";
import users from "./users/index";
import apps from "./apps";
import uploads from "./files";
import organisation from "./organisation";

export default (app, container, config) => {
  const route = Router();
  app.use("/admin", route);

  // Create User Routes Admin Routes
  users(route);

  // Authenticated routes
  route.use(middlewares.authenticateAdmin());
  route.use(middlewares.registeredLoggedinUser);

  apps(route);
  organisation(route);
  uploads(route);
  return app;
};
