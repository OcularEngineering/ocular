import { v4 as uuidv4 } from "uuid"
import os from "os"
import { join } from "path"

class InMemoryConfigStore {
  private config:object = {}
  private path:string = join(os.tmpdir(), `medusa`)

  private static instance:InMemoryConfigStore

  constructor() {
    this.config = this.createBaseConfig()
  }

  static getInstance(){
    if(!InMemoryConfigStore.instance){
      InMemoryConfigStore.instance = new InMemoryConfigStore()
    }
    return InMemoryConfigStore.instance
  }

  createBaseConfig() {
    return {
      "telemetry.enabled": true,
      "telemetry.machine_id": `not-a-machine-id-${uuidv4()}`,
    }
  }

  get(key) {
    return this.config[key]
  }

  set(key, value) {
    this.config[key] = value
  }

  all() {
    return this.config
  }

  size() {
    return Object.keys(this.config).length
  }

  has(key) {
    return !!this.config[key]
  }

  del(key) {
    delete this.config[key]
  }

  clear() {
    this.config = this.createBaseConfig()
  }
}

export default InMemoryConfigStore.getInstance()