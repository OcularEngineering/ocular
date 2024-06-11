import { v4 as uuidv4 } from "uuid"
import os from "os"
import { join } from "path"

class InMemoryConfigStore {
  private config:object = {}
  public path:string = join(os.tmpdir(), `medusa`)

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

  public createBaseConfig() {
    return {
      "telemetry.enabled": true,
      "telemetry.machine_id": `not-a-machine-id-${uuidv4()}`,
    }
  }

  public get(key) {
    return this.config[key]
  }

  public set(key, value) {
    this.config[key] = value
  }

  public all() {
    return this.config
  }

  public size() {
    return Object.keys(this.config).length
  }

  public has(key) {
    return !!this.config[key]
  }

  public del(key) {
    delete this.config[key]
  }

  public clear() {
    this.config = this.createBaseConfig()
  }
}

export default InMemoryConfigStore.getInstance()