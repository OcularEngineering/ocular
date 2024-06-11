import path from "path"
import {
  appendFileSync,
  statSync,
  readFileSync,
  renameSync,
  readdirSync,
  existsSync,
  unlinkSync,
} from "fs"

import isTruthy from "./is-truthy"

const OCULAR_TELEMETRY_VERBOSE = process.env.OCULAR_TELEMETRY_VERBOSE || false

class Outbox {
  eventsJsonFileName: string
  bufferFilePath: string
  baseDir:string

  constructor(baseDir:string) {
    this.eventsJsonFileName = `events.json`
    this.bufferFilePath = path.join(baseDir, this.eventsJsonFileName)
    this.baseDir = baseDir
  }

  public appendToBuffer(event:string) :string{
    try {
      appendFileSync(this.bufferFilePath, event, `utf8`)
    } catch (e) {
      if (isTruthy(OCULAR_TELEMETRY_VERBOSE)) {
        console.error("Failed to append to buffer", e)
      }
    }
    return this.bufferFilePath
  }

  public getSize():number {
    if (!existsSync(this.bufferFilePath)) {
      return 0
    }

    try {
      const stats = statSync(this.bufferFilePath)
      return stats.size
    } catch (e) {
      if (isTruthy(OCULAR_TELEMETRY_VERBOSE)) {
        console.error("Failed to get outbox size", e)
      }
    }
    return 0
  }

  public getCount():number {
    if (!existsSync(this.bufferFilePath)) {
      return 0
    }

    try {
      const fileBuffer = readFileSync(this.bufferFilePath)
      const str = fileBuffer.toString()
      const lines = str.split("\n")
      return lines.length - 1
    } catch (e) {
      if (isTruthy(OCULAR_TELEMETRY_VERBOSE)) {
        console.error("Failed to get outbox count", e)
      }
    }
    return 0
  }

  public async flushFile(filePath:string, flushOperation) {
    const now = `${Date.now()}-${process.pid}`
    let success = false
    let contents = ``
    try {
      if (!existsSync(filePath)) {
        return true
      }
      // Unique temporary file name across multiple concurrent Ocular instances
      const newPath = `${this.bufferFilePath}-${now}`
      renameSync(filePath, newPath)
      contents = readFileSync(newPath, `utf8`)
      unlinkSync(newPath)

      // There is still a chance process dies while sending data and some events are lost
      // This will be ok for now, however
      success = await flushOperation(contents)
    } catch (e) {
      if (isTruthy(OCULAR_TELEMETRY_VERBOSE)) {
        console.error("Failed to perform file flush", e)
      }
    } finally {
      // if sending fails, we write the data back to the log
      if (!success) {
        if (isTruthy(OCULAR_TELEMETRY_VERBOSE)) {
          console.error(
            "File flush did not succeed - writing back to file",
            success
          )
        }
        this.appendToBuffer(contents)
      }
    }
    return true
  }

  public async startFlushEvents(flushOperation) {
    try {
      await this.flushFile(this.bufferFilePath, flushOperation)
      const files = readdirSync(this.baseDir)
      const filtered = files.filter(p => p.startsWith(`events.json`))
      for (const file of filtered) {
        await this.flushFile(path.join(this.baseDir, file), flushOperation)
      }
      return true
    } catch (e) {
      if (isTruthy(OCULAR_TELEMETRY_VERBOSE)) {
        console.error("Failed to perform flush", e)
      }
    }
    return false
  }
}

export default Outbox