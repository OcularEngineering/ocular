import fs from "fs"
import isDocker from "is-docker"
import os from "os"
import { join, sep } from "path"
import { v4 as uuidv4 } from "uuid"

import Store from "./store"
import createFlush from "./util/create-flush"
import getTermProgram from "./util/get-term-program"
import { getCIName, isCI } from "./util/is-ci"
import isTruthy from "./util/is-truthy"
import showAnalyticsNotification from "./util/show-notification"

const OCULAR_TELEMETRY_VERBOSE = process.env.OCULAR_TELEMETRY_VERBOSE || false

class Telemeter {
  constructor(options = {}) {
    this.store_ = new Store()

    this.flushAt = Math.max(options.flushAt, 1) || 20
    this.maxQueueSize = options.maxQueueSize || 1024 * 500
    this.flushInterval = options.flushInterval || 10 * 1000
    this.flushed = false

    this.queueSize_ = this.store_.getQueueSize()
    this.queueCount_ = this.store_.getQueueCount()

    this.featureFlags_ = new Set()
    this.apps_ = []
    this.plugins_ = []
  }

  getMachineId() {
    if (this.machineId) {
      return this.machineId
    }
    let machineId = this.store_.getConfig(`telemetry.machine_id`)
    if (typeof machineId !== `string`) {
      machineId = uuidv4()
      this.store_.setConfig(`telemetry.machine_id`, machineId)
    }
    this.machineId = machineId
    return machineId
  }

  isTrackingEnabled() {
    // Cache the result
    if (this.trackingEnabled !== undefined) {
      return this.trackingEnabled
    }
    let enabled = this.store_.getConfig(`telemetry.enabled`)
    if (enabled === undefined || enabled === null) {
      if (!isCI()) {
        // showAnalyticsNotification()
      }
      enabled = true
      this.store_.setConfig(`telemetry.enabled`, enabled)
    }
    this.trackingEnabled = enabled
    return enabled
  }

  getOsInfo() {
    if (this.osInfo) {
      return this.osInfo
    }
    const cpus = os.cpus()
    const osInfo = {
      node_version: process.version,
      platform: os.platform(),
      release: os.release(),
      cpus: (cpus && cpus.length > 0 && cpus[0].model) || undefined,
      is_ci: isCI(),
      ci_name: getCIName(),
      arch: os.arch(),
      docker: isDocker(),
      term_program: getTermProgram(),
    }
    this.osInfo = osInfo
    return osInfo
  }

  getOcularVersion() {
    try {
      const packageJson = require.resolve(`@ocular/ocular/package.json`)
      const { version } = JSON.parse(fs.readFileSync(packageJson, `utf-8`))
      return version
    } catch (e) {
      if (isTruthy(OCULAR_TELEMETRY_VERBOSE)) {
        console.error("failed to get ocular version", e)
      }
    }
    return `-0.0.0`
  }

  setTelemetryEnabled(enabled) {
    this.trackingEnabled = enabled
    this.store_.setConfig(`telemetry.enabled`, enabled)
  }

  track(event, data) {
    return this.enqueue_(event, data)
  }

  enqueue_(type, data) {
    const event = {
      event:type,
      distinct_id: this.getMachineId(),
      properties:{
        ...data,
        machine_id: this.getMachineId(),
        os_info: this.getOsInfo(),
        ocular_version: this.getOcularVersion(),
        apps: this.apps_,
        plugins: this.plugins_,
      },
      timestamp: new Date(),
    }
    this.store_.addEvent(event)

    this.queueCount_ += 1
    this.queueSize_ += JSON.stringify(event).length

    const hasReachedFlushAt = this.queueCount_ >= this.flushAt
    const hasReachedQueueSize = this.queueSize_ >= this.maxQueueSize

    if (hasReachedQueueSize || hasReachedFlushAt) {
      const flush = createFlush(this.isTrackingEnabled())
      flush && flush()
    }

    if (this.flushInterval && !this.timer) {
      const flush = createFlush(this.isTrackingEnabled())
      if (flush) {
        this.timer = setTimeout(flush, this.flushInterval)
      }
    }
  }


  trackApp(app) {
    if (app) {
      this.apps_.push(app)
    }
  }

  trackPlugin(plugin) {
    if (plugin) {
      this.plugins_.push(plugin)
    }
  }
}

export default Telemeter