import { BatchJobService, Organisation, QueueService } from "@ocular/ocular";
import SlackService from "../services/slack";
import { INDEX_DOCUMENT_EVENT, APPS_INDEXING_TOPIC } from "@ocular/types";
import { AbstractBatchJobStrategy, Logger } from "@ocular/types";

export default class SlackStrategy extends AbstractBatchJobStrategy {
  static identifier = "slack-indexing-strategy";
  static batchType = "slack";
  protected batchJobService_: BatchJobService;
  protected slackService_: SlackService;
  protected queueService_: QueueService;
  protected logger_: Logger;

  constructor(container) {
    super(arguments[0]);
    this.slackService_ = container.slackService;
    this.batchJobService_ = container.batchJobService;
    this.queueService_ = container.queueService;
    this.logger_ = container.logger;
  }

  async processJob(batchJobId: string): Promise<void> {
    // Improvements : Check if the status of the previous job scheduled to Occulate Google Drive is still running.
    // If it is running, then skip running this job.
    // Get Context To Start Job From The BatchJob Context
    const batchJob = await this.batchJobService_.retrieve(batchJobId);
    const org = batchJob.context?.org as Organisation;
    // Start Tracking The Activity of The Indexing Process
    const oculationSlackActivity = this.logger_.activity(
      `processJob: Oculating Slack for organisation: ${org.id} name: ${org.name}`
    );

    const stream = await this.slackService_.getSlackData(
      batchJob.context?.org as Organisation
    );

    stream.on("data", (documents) => {
      this.queueService_.sendBatch(APPS_INDEXING_TOPIC, documents);
    });

    // Log The End of The Indexing Process
    stream.on("error", () => {
      this.logger_.error(
        oculationSlackActivity,
        `processJob:Starting oculation of Slack for ${org.id} organisation`
      );
    });

    // Log The Error of The Indexing Process
    stream.on("end", () => {
      this.logger_.success(
        oculationSlackActivity,
        `processJob:Starting oculation of Slack for ${org.id} organisation`
      );
    });
  }

  buildTemplate(): Promise<string> {
    throw new Error("Method not implemented.");
  }
}
