// import cors from "cors"
import { Router } from "express"
// import errorHandler from "./middlewares/error-handler"
// import { parseCorsOrigins } from "medusa-core-utils"
// import authRoutes from "./auth"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default (container, config) => {
  const app = Router()
  app.use("/")

  // const appCors = config.admin_cors || ""
  // app.use(
  //   cors({
  //     origin: parseCorsOrigins(appCors),
  //     credentials: true,
  //   })
  // )

  // app.use(errorHandler())
  return app
}

