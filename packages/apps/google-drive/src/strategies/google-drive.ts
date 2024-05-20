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

  constructor(container) {
    super(arguments[0]);
    this.googleDriveService_ = container.googleDriveService;
    this.batchJobService_ = container.batchJobService;
    this.queueService_ = container.queueService;
  }

  async processJob(batchJobId: string): Promise<void> {
    const batchJob = await this.batchJobService_.retrieve(batchJobId);
    const stream = await this.googleDriveService_.getGoogleDriveData(
      batchJob.context?.org as Organisation
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

export default GoogleDriveStrategy;
