// Glob only works with require
const glob = require("glob");
const fg = require('fast-glob');

import path from "path"

import formatRegistrationName from "../utils/format-registration-name"
import {AutoflowContainer } from "@ocular/types"
import { asValue } from "awilix"

/**
 * Registers all models in the model directory
 */
export default ({
  container,
  isTest,
}: {
  container: AutoflowContainer
  isTest?: boolean
}): void => {
  const corePath = isTest ? "../repositories/*.ts" : "../repositories/*.js"
  const coreFull = path.join(__dirname, corePath)

  const core = glob.sync(coreFull, { cwd: __dirname })
  core.forEach((fn) => {
    const loaded = require(fn).default

    if (typeof loaded === "object") {
      const name = formatRegistrationName(fn)
      container.register({
        [name]: asValue(loaded),
      })
    }
  })
}
