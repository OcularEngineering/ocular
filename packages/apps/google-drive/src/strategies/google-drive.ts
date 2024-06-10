import {
  BatchJobService,
  Organisation,
  EventBusService,
  QueueService,
} from "@ocular/ocular";
import { EntityManager } from "typeorm";
import GoogleDriveService from "../services/google-drive";
import JobSchedulerService from "@ocular/ocular";
import e from "express";
import {
  INDEX_DOCUMENT_EVENT,
  AbstractBatchJobStrategy,
  APPS_INDEXING_TOPIC,
  Logger,
} from "@ocular/types";

class GoogleDriveStrategy extends AbstractBatchJobStrategy {
  static identifier = "google-drive-indexing-strategy";
  static batchType = "google-drive";
  protected batchJobService_: BatchJobService;
  protected googleDriveService_: GoogleDriveService;
  protected queueService_: QueueService;
  protected logger_: Logger;

  constructor(container) {
    super(arguments[0]);
    this.googleDriveService_ = container.googleDriveService;
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
    const oculationGoogleDriveActivity = this.logger_.activity(
      `processJob: Oculating Google Drive for organisation: ${org.id} name: ${org.name}`
    );

    // Start The Indexing Process
    const stream = await this.googleDriveService_.getGoogleDriveData(org);

    // Stream The Data To The Kafka Queue
    stream.on("data", (documents) => {
      this.queueService_.sendBatch(APPS_INDEXING_TOPIC, documents);
    });

    // Log The End of The Indexing Process
    stream.on("end", () => {
      this.logger_.success(
        oculationGoogleDriveActivity,
        `processJob:Starting oculation of Google Drive for ${org.id} organisation`
      );
    });

    // Log The Error of The Indexing Process
    stream.on("end", () => {
      this.logger_.error(
        oculationGoogleDriveActivity,
        `processJob:Starting oculation of Google Drive for ${org.id} organisation`
      );
    });
  }

  buildTemplate(): Promise<string> {
    throw new Error("Method not implemented.");
  }
}

export default GoogleDriveStrategy;
