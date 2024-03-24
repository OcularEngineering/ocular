// Glob only works with require
const glob = require("glob");
import { asFunction, Lifetime } from "awilix"
import path from "path"
import { AutoflowContainer } from "@ocular/types"
import  {ConfigModule} from "../types/config-module"
import formatRegistrationName from "../utils/format-registration-name"

type Options = {
  container: AutoflowContainer
  configModule: ConfigModule
}

/**
 * Registers all services in the services directory
 */ 
export default ({ container, configModule}: Options): void => {
  const corePath = "../approaches/*.js"
  const coreFull = path.join(__dirname, corePath)

  const approaches = glob.sync(coreFull, { cwd: __dirname })
  approaches.forEach((fn) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const loaded = require(fn).default
    const name = formatRegistrationName(fn)
    if (typeof loaded !== "function") {
      throw new Error(
        `Cannot register ${name}. Make sure to default export an approach class in ${fn}`
      )
    }

    if (loaded) {
      container.registerAdd(
        "searchApproaches",
        asFunction((cradle) => new loaded(cradle, configModule), {
        lifetime: Lifetime.SINGLETON,
      })
    )

    container.register({
      [name]: asFunction(
        (cradle) => new loaded(cradle, configModule),
        {
          lifetime: Lifetime.SINGLETON,
        }
      )
    })
    }
  })
}
