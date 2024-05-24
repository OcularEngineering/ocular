import TelemetryDispatcher from "./telemetry-dispatcher"

const OCULAR_TELEMETRY_HOST = process.env.OCULAR_TELEMETRY_HOST || ""
const OCULAR_TELEMETRY_PATH = process.env.OCULAR_TELEMETRY_PATH || ""

const dispatcher = new TelemetryDispatcher({
  host: OCULAR_TELEMETRY_HOST,
  path: OCULAR_TELEMETRY_PATH,
})
dispatcher.dispatch()