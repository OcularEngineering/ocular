import { asFunction } from "awilix"
import glob from "glob"
import { isDefined } from "medusa-core-utils"
import path from "path"
import { AutoflowContainer } from "../types/global"
import  {ConfigModule} from "../types/config-module"
import formatRegistrationName from "../utils/format-registration-name"

type Options = {
  container: AutoflowContainer
  configModule: ConfigModule
  isTest?: boolean
}

/**
 * Registers all services in the services directory
 */
export default ({ container, configModule, isTest }: Options): void => {
  const useMock = isDefined(isTest) ? isTest : process.env.NODE_ENV === "test"

  const corePath = useMock ? "../services/__mocks__/*.js" : "../services/*.js"
  const coreFull = path.join(__dirname, corePath)

  const core = glob.sync(coreFull, { cwd: __dirname })
  core.forEach((fn) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const loaded = require(fn).default
    if (loaded) {
      const name = formatRegistrationName(fn)
      container.register({
        [name]: asFunction(
          (cradle) => new loaded(cradle, configModule)
        ).singleton(),
      })
    }
  })
}
