import Telemeter from "./telemeter"
import createFlush from "./util/create-flush"

const telemeter = new Telemeter({
  flushAt:20,
  maxQueueSize:1024*500,
  flushInterval:10*1000
})

export const flush = createFlush(telemeter.isTrackingEnabled())

if (flush) {
  process.on(`exit`, flush)
}

export const track = (event:string, data = {}):void => {
  telemeter.track(event, data)
}

export const setTelemetryEnabled = (enabled:boolean = true) :void=> {
  telemeter.setTelemetryEnabled(enabled)
}

export function trackInstallation(installation, type:"plugin"|"app") :void{
  switch (type) {
    case `plugin`:
      telemeter.trackPlugin(installation)
      break
    case `app`:
      telemeter.trackApp(installation)
      break
  }
}

export {Telemeter}