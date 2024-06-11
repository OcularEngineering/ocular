import Configstore from "configstore";
import path from "path";

import InMemoryConfigStore from "./util/in-memory-config";
import isTruthy from "./util/is-truthy";
import OutboxStore from "./util/outbox-store";

class Store {
  private config_: typeof InMemoryConfigStore;
  private outbox_: OutboxStore;
  private disabled_: boolean;

  private static instance: Store;

  constructor() {
    try {
      this.config_ = new Configstore(`ocular`, {}, { globalConfigPath: true });
    } catch (e) {
      console.error(e);
    }

    const baseDir = path.dirname(this.config_.path);
    this.outbox_ = new OutboxStore(baseDir);

    this.disabled_ = isTruthy(process.env.OCULAR_DISABLE_TELEMETRY);
  }

  static getInstance(): Store {
    if (!Store.instance) {
      Store.instance = new Store();
    }
    return Store.instance;
  }

  public getQueueSize(): number {
    return this.outbox_.getSize();
  }

  public getQueueCount(): number {
    return this.outbox_.getCount();
  }

  public addEvent(event): string | null {
    if (this.disabled_) {
      return;
    }
    const eventString = JSON.stringify(event);
    return this.outbox_.appendToBuffer(eventString + `\n`);
  }

  public async flushEvents(
    handler: (events: any[]) => Promise<boolean>
  ): Promise<boolean> {
    return await this.outbox_.startFlushEvents(async (eventData: string) => {
      const events = eventData
        .split(`\n`)
        .filter((e) => e && e.length > 2)
        .map((e) => JSON.parse(e));

      return await handler(events);
    });
  }

  public getConfig(path: string): any {
    return this.config_.get(path);
  }

  public setConfig(path: string, val: any): void {
    return this.config_.set(path, val);
  }
}

export default Store;
