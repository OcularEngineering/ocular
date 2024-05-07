// Glob only works with require
const glob = require("glob");

import path from "path";
import { asFunction } from "awilix";
import { pathByOS } from "@ocular/utils";
import { AutoflowContainer } from "@ocular/types";

/**
 * Registers all subscribers in the subscribers directory
 */
export default ({ container }: { container: AutoflowContainer }) => {
  const isTest = process.env.NODE_ENV === "test";

  const corePath = isTest
    ? "../subscribers/__mocks__/*.js"
    : "../subscribers/*.js";
  const coreFull = path.join(__dirname, corePath);

  const core = glob.sync(pathByOS(coreFull), { cwd: __dirname });
  core.forEach((fn) => {
    const loaded = require(fn).default;
    container.build(asFunction((cradle) => new loaded(cradle)).singleton());
  });
};
