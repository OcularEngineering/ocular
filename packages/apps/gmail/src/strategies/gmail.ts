import { EntityManager } from "typeorm";
import {
  BatchJobService,
  Organisation,
  EventBusService,
  QueueService,
} from "@ocular/ocular";
import GmailService from "../services/gmail";
import JobSchedulerService from "@ocular/ocular";
import e from "express";
import {
  INDEX_DOCUMENT_EVENT,
  AbstractBatchJobStrategy,
  APPS_INDEXING_TOPIC,
  Logger,
} from "@ocular/types";

class GmailStrategy extends AbstractBatchJobStrategy {
  static identifier = "gmail-indexing-strategy";
  static batchType = "gmail";
  protected batchJobService_: BatchJobService;
  protected gmailService_: GmailService;
  protected queueService_: QueueService;
  protected logger_: Logger;

  constructor(container) {
    super(arguments[0]);
    this.gmailService_ = container.gmailService;
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
    const oculationGmailActivity = this.logger_.activity(
      `processJob: Oculating Google Drive for organisation: ${org.id} name: ${org.name}`
    );

    // Start The Indexing Process
    const stream = await this.gmailService_.getGmailData(
      batchJob.context?.org as Organisation
    );

    stream.on("data", (documents) => {
      this.queueService_.sendBatch(APPS_INDEXING_TOPIC, documents);
    });

    // Log The End of The Indexing Process
    stream.on("end", () => {
      this.logger_.error(
        oculationGmailActivity,
        `processJob:Starting oculation of Gmail for ${org.id} organisation`
      );
    });

    // Log The Error of The Indexing Process
    stream.on("end", () => {
      this.logger_.success(
        oculationGmailActivity,
        `processJob:Starting oculation of Gmail for ${org.id} organisation`
      );
    });
  }

  buildTemplate(): Promise<string> {
    throw new Error("Method not implemented.");
  }
}

export default GmailStrategy;
