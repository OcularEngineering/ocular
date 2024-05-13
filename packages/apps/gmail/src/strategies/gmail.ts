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
} from "@ocular/types";

class GmailStrategy extends AbstractBatchJobStrategy {
  static identifier = "gmail-indexing-strategy";
  static batchType = "gmail";
  protected batchJobService_: BatchJobService;
  protected gmailService_: GmailService;
  protected queueService_: QueueService;

  constructor(container) {
    super(arguments[0]);
    this.gmailService_ = container.gmailService;
    this.batchJobService_ = container.batchJobService;
    this.queueService_ = container.queueService;
  }

  async processJob(batchJobId: string): Promise<void> {
    const batchJob = await this.batchJobService_.retrieve(batchJobId);
    const stream = await this.gmailService_.getGmailData(
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

export default GmailStrategy;
