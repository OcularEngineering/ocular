import TelemetryDispatcher from "./telemetry-dispatcher"
import axios, { AxiosInstance, AxiosStatic } from "axios";

const OCULAR_TELEMETRY_HOST = process.env.OCULAR_TELEMETRY_HOST || ""
const OCULAR_TELEMETRY_PUBLIC_KEY = process.env.OCULAR_TELEMETRY_PUBLIC_KEY || ""
let axiosInstance :AxiosInstance|AxiosStatic

const dispatcher = new TelemetryDispatcher({
  host: OCULAR_TELEMETRY_HOST,
  public_key: OCULAR_TELEMETRY_PUBLIC_KEY,
  axiosInstance:axiosInstance,
  timeout:false
})

dispatcher.dispatch()