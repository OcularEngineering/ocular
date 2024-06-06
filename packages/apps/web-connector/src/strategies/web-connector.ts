import {
  BatchJobService,
  Organisation,
  EventBusService,
  QueueService,
} from "@ocular/ocular";
import WebConnectorService from "../services/web-connector";
import { INDEX_DOCUMENT_EVENT } from "@ocular/types";
import { AbstractBatchJobStrategy, APPS_INDEXING_TOPIC } from "@ocular/types";

class WebConnectorStrategy extends AbstractBatchJobStrategy {
  static identifier = "web-connector-indexing-strategy";
  static batchType = "web-connector";
  protected batchJobService_: BatchJobService;
  protected webConnectorService_: WebConnectorService;
  protected queueService_: QueueService;

  constructor(container) {
    super(arguments[0]);
    this.webConnectorService_ = container.webConnectorService;
    this.batchJobService_ = container.batchJobService;
    this.queueService_ = container.queueService;
  }

  async processJob(batchJobId: string): Promise<void> {
    const batchJob = await this.batchJobService_.retrieve(batchJobId);
    const stream = await this.webConnectorService_.getWebConnectorData(
      batchJob.context?.org as Organisation,
      batchJob.context?.link as string,
      batchJob.context?.link_id as string
    );
    stream.on("data", (documents) => {
      this.queueService_.sendBatch(APPS_INDEXING_TOPIC, documents);
    });
    stream.on("end", () => {
      console.log("No more data");
    });
  }

  buildTemplate(): Promise<string> {
    throw new Error("Method not implemented.");
  }
}

export default WebConnectorStrategy;
