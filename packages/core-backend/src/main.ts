import "reflect-metadata";
import "core-js/stable"
import "regenerator-runtime/runtime"
import "reflect-metadata";

import express from "express"
import path from "path"
import  {GracefulShutdownServer}  from "./utils/graceful-shutdown-server"
import loaders from "./loaders/index.js";

const app = express()
const rootDirectory = path.resolve(`.`)   
// const host = `localhost`
const port = `9000`

async function start() {
  try {

    await loaders({ directory:rootDirectory, expressApp: app })
    console.log(`Creating server`)
    const server = GracefulShutdownServer.create(
      app.listen(port,() => {
        console.log(`Server is ready on port: ${port}`);
      }).on("error", (err) => {
        console.log("Error starting server", err)
      })
    )


    // Handle graceful shutdown
    const gracefulShutDown = () => {
      server
        .shutdown()
        .then(() => {
         console.log("Gracefully stopping the server.")
          process.exit(0)
        })
        .catch((e) => {
          console.log("Error received when shutting down the server.", e)
          process.exit(1)
        })
    }
    process.on("SIGTERM", gracefulShutDown)
    process.on("SIGINT", gracefulShutDown)
  } catch (err) {
    console.log("Error starting server", err)
    process.exit(1)
  }
}
start()