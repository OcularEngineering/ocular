import { BatchJobService, Organisation, QueueService } from "@ocular/ocular";
import ConfluenceService from "../services/confluence";
import {
  INDEX_DOCUMENT_EVENT,
  APPS_INDEXING_TOPIC,
  Logger,
  AbstractBatchJobStrategy,
} from "@ocular/types";

export default class ConfluenceStrategy extends AbstractBatchJobStrategy {
  static identifier = "confluence-indexing-strategy";
  static batchType = "confluence";
  protected batchJobService_: BatchJobService;
  protected confluenceService_: ConfluenceService;
  protected queueService_: QueueService;
  protected logger_: Logger;

  constructor(container) {
    super(arguments[0]);
    this.confluenceService_ = container.confluenceService;
    this.batchJobService_ = container.batchJobService;
    this.queueService_ = container.queueService;
    this.logger_ = container.logger;
  }

  async processJob(batchJobId: string): Promise<void> {
    const batchJob = await this.batchJobService_.retrieve(batchJobId);

    const org = batchJob.context?.org as Organisation;

    const oculationConfluenceActivity = this.logger_.activity(
      `processJob: Oculating Confluence Data for organisation: ${org.id} name: ${org.name}`
    );

    const stream = await this.confluenceService_.getConfluenceData(org);

    stream.on("data", (documents) => {
      this.queueService_.sendBatch(APPS_INDEXING_TOPIC, documents);
    });

    stream.on("end", () => {
      this.logger_.success(
        oculationConfluenceActivity,
        `processJob:Finished oculation of Confluence Data for ${org.id} organisation`
      );
    });

    stream.on("error", () => {
      this.logger_.error(
        oculationConfluenceActivity,
        `processJob:Error in oculation of Confluence Data for ${org.id} organisation`
      );
    });
  }

  buildTemplate(): Promise<string> {
    throw new Error("Method not implemented.");
  }
}
