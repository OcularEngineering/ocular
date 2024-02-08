// import cors from "cors"
import { Router } from "express"
// import errorHandler from "./middlewares/error-handler"
import routes from "./routes"
import cors from "cors"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default (container, config) => {
  const app = Router()
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
  routes(app,container,config)

  // app.use(errorHandler())

  return app
}

