import removeSlash from "remove-trailing-slash"
import axios from "axios"
import axiosRetry from "axios-retry"

import showAnalyticsNotification from "./show-notification"
import Store from "../store"
import isTruthy from "./is-truthy"

const OCULAR_TELEMETRY_VERBOSE = process.env.OCULAR_TELEMETRY_VERBOSE || false
class TelemetryDispatcher {
  constructor(options) {
    this.store_ = new Store()

    this.host = removeSlash(
      options.host || "https://us.i.posthog.com/batch/"
    )
    this.public_key = options.public_key || "phc_fExEtFcrzPBqQ17LW0UbP4umSAnRHpPfOVIScJKvj0B"

    let axiosInstance = options.axiosInstance
    if (!axiosInstance) {
      axiosInstance = axios.create()
    }
    this.axiosInstance = axiosInstance

    this.timeout = options.timeout || false
    this.flushed = false

    axiosRetry(this.axiosInstance, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: this.isErrorRetryable_,
    })
  }

  isTrackingEnabled() {
    // Cache the result
    if (this.trackingEnabled !== undefined) {
      return this.trackingEnabled
    }
    let enabled = this.store_.getConfig(`telemetry.enabled`)
    if (enabled === undefined || enabled === null) {
      showAnalyticsNotification()
      enabled = true
      this.store_.setConfig(`telemetry.enabled`, enabled)
    }
    this.trackingEnabled = enabled
    return enabled
  }

  async dispatch() {
    if (!this.isTrackingEnabled()) {
      return
    }

    await this.store_.flushEvents(async events => {
      if (!events.length) {
        if (isTruthy(OCULAR_TELEMETRY_VERBOSE)) {
          console.log("No events to POST - skipping")
        }
        return true
      }

      const data = {
        api_key: this.public_key,
        batch: events,
        timestamp: new Date(),
      };

      const req = {
        headers: {
          'Content-Type': 'application/json'
        },
      }

      return await this.axiosInstance
        .post(`${this.host}`, data, req)
        .then(() => {
          if (isTruthy(OCULAR_TELEMETRY_VERBOSE)) {
            console.log("Posting batch succeeded")
          }
          return true
        })
        .catch(e => {
          if (isTruthy(OCULAR_TELEMETRY_VERBOSE)) {
            console.error("Failed to POST event batch", e)
          }
          return false
        })
    })
  }

  isErrorRetryable_(error) {
    // Retry Network Errors.
    if (axiosRetry.isNetworkError(error)) {
      return true
    }

    if (!error.response) {
      // Cannot determine if the request can be retried
      return false
    }

    // Retry Server Errors (5xx).
    if (error.response.status >= 500 && error.response.status <= 599) {
      return true
    }

    // Retry if rate limited.
    if (error.response.status === 429) {
      return true
    }

    return false
  }
}

export default TelemetryDispatcher