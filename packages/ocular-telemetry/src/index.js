import Telemeter from "./telemeter"
import createFlush from "./util/create-flush"

const telemeter = new Telemeter()

export const flush = createFlush(telemeter.isTrackingEnabled())

if (flush) {
  process.on(`exit`, flush)
}

export const track = (event, data = {}) => {
  telemeter.track(event, data)
}

export const setTelemetryEnabled = (enabled = true) => {
  telemeter.setTelemetryEnabled(enabled)
}

export function trackInstallation(installation, type) {
  switch (type) {
    case `plugin`:
      telemeter.trackPlugin(installation)
      break
    case `app`:
      telemeter.trackApp(installation)
      break
  }
}

export { default as Telemeter } from "./telemeter"