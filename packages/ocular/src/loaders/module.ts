// Glob only works with require
const glob = require("glob");
const fg = require("fast-glob");

import { asFunction } from "awilix";
import path from "path";
import { AutoflowContainer } from "@ocular/types";
import { ConfigModule } from "../types/config-module";
import formatRegistrationName from "../utils/format-registration-name";
import { pathByOS } from "@ocular/utils";

type Options = {
  container: AutoflowContainer;
  configModule: ConfigModule;
};

/**
 * Registers all services in the services directory
 */
export default ({ container, configModule }: Options): void => {
  const corePath = "../modules/*.js";
  const coreFull = pathByOS(path.join(__dirname, corePath));
  const core = glob.sync(coreFull, { cwd: __dirname });
  core.forEach((fn) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const loaded = require(fn).default;
    if (loaded) {
      const name = formatRegistrationName(fn);
      container.register({
        [name]: asFunction(
          (cradle) => new loaded(cradle, configModule)
        ).singleton(),
      });
    }
  });
};
