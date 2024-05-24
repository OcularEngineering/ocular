import TelemetryDispatcher from "./telemetry-dispatcher"

const OCULAR_TELEMETRY_HOST = process.env.OCULAR_TELEMETRY_HOST || ""
const OCULAR_TELEMETRY_PUBLIC_KEY = process.env.OCULAR_TELEMETRY_PUBLIC_KEY || ""

const dispatcher = new TelemetryDispatcher({
  host: OCULAR_TELEMETRY_HOST,
  public_key: OCULAR_TELEMETRY_PUBLIC_KEY,
})

dispatcher.dispatch()