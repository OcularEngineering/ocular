import { BatchJobService, Organisation, EventBusService } from "@ocular/ocular";
import webConnectorService from "../services/webConnector";
import { INDEX_DOCUMENT_EVENT } from "@ocular/types";
import { AbstractBatchJobStrategy } from "@ocular/types";

export default class webConnectorStrategy extends AbstractBatchJobStrategy {
  static identifier = "webConnector-indexing-strategy";
  static batchType = "webConnector";
  protected batchJobService_: BatchJobService;
  protected webConnectorService_: webConnectorService;
  protected eventBusService_: EventBusService;

  constructor(container) {
    super(arguments[0]);
    this.webConnectorService_ = container.webConnectorService;
    this.batchJobService_ = container.batchJobService;
    this.eventBusService_ = container.eventBusService;
  }

  async processJob(batchJobId: string): Promise<void> {
    const batchJob = await this.batchJobService_.retrieve(batchJobId);
    const stream = await this.webConnectorService_.getWebConnectorData(
      batchJob.context?.org as Organisation,
      batchJob.context?.link as string,
      batchJob.context?.link_id as string
    );
    stream.on("data", (documents) => {
      this.eventBusService_.emit(INDEX_DOCUMENT_EVENT, documents);
    });
    stream.on("end", () => {
      console.log("No more data");
    });
  }

  buildTemplate(): Promise<string> {
    throw new Error("Method not implemented.");
  }
}
