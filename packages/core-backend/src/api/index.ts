// import cors from "cors"
import { Router } from "express"
// import errorHandler from "./middlewares/error-handler"
import cors from "cors"
import admin from "./routes/admin"
import member from "./routes/member"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const app = Router()
export default (container, config) => {
  const adminRouter = Router()
  const memberRouter = Router()

  // const httpCompressionOptions = compressionOptions(config)

  // if (httpCompressionOptions.enabled) {
  //   app.use(
  //     compression({
  //       filter: shouldCompressResponse,
  //       ...httpCompressionOptions,
  //     })
  //   )
  // }
  // app.use("/v1")
 
 const uiCors = config.ui_cors || ""
  app.use(
    cors({
      origin: uiCors,
      credentials: true,
    })
  )
  app.use("/v1", adminRouter)
  app.use("/v1", memberRouter)

  // Admin Routes
  admin(adminRouter,container,config)

   // Member Routes
  member(adminRouter,container,config)

  // app.use(errorHandler())
  return app
}