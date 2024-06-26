import { BatchJobService, Organisation, QueueService } from "@ocular/ocular";
import AsanaService from "../services/asana";
import { INDEX_DOCUMENT_EVENT, APPS_INDEXING_TOPIC } from "@ocular/types";
import { AbstractBatchJobStrategy, Logger } from "@ocular/types";

export default class AsanaStrategy extends AbstractBatchJobStrategy {
  static identifier = "asana-indexing-strategy";
  static batchType = "asana";
  protected batchJobService_: BatchJobService;
  protected asanaService_: AsanaService;
  protected queueService_: QueueService;
  protected logger_: Logger;

  constructor(container) {
    super(arguments[0]);
    this.asanaService_ = container.asanaService;
    this.batchJobService_ = container.batchJobService;
    this.queueService_ = container.queueService;
    this.logger_ = container.logger;
  }

  async processJob(batchJobId: string): Promise<void> {
    const batchJob = await this.batchJobService_.retrieve(batchJobId);
    const org = batchJob.context?.org as Organisation;
    const oculationAsanaActivity = this.logger_.activity(
      `processJob: Oculating Asana for organisation: ${org.id} name: ${org.name}`
    );

    const stream = await this.asanaService_.getAsanaData(
      batchJob.context?.org as Organisation
    );

    stream.on("data", (documents) => {
      this.queueService_.sendBatch(APPS_INDEXING_TOPIC, documents);
    });

    // Log The End of The Indexing Process
    stream.on("error", () => {
      this.logger_.error(
        oculationAsanaActivity,
        `processJob: Error oculation of Asana for ${org.id} organisation`
      );
    });

    // Log The Error of The Indexing Process
    stream.on("end", () => {
      this.logger_.success(
        oculationAsanaActivity,
        `processJob: Done oculation of Asana for ${org.id} organisation`
      );
    });
  }

  buildTemplate(): Promise<string> {
    throw new Error("Method not implemented.");
  }
}
