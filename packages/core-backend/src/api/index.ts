// import cors from "cors"
import { Router } from "express"
// import errorHandler from "./middlewares/error-handler"
// import { parseCorsOrigins } from "medusa-core-utils"
import routes from "./routes"

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
  routes(app,container,config)

  // app.use(errorHandler())

  return app
}

