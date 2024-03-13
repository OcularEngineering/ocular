import {AbstractBatchJobStrategy } from "@ocular-ai/core-backend/dist/core-backend/src/interfaces"
import { BatchJobService, Organisation, EventBusService } from "@ocular-ai/core-backend"
import { EntityManager } from "typeorm"
import GmailService from "../services/gmail"
import JobSchedulerService from "@ocular-ai/core-backend"
import e from "express"
import { INDEX_DOCUMENT_EVENT } from "@ocular-ai/types"

class GmailStrategy extends AbstractBatchJobStrategy {
  static identifier = "gmail-indexing-strategy"
  static batchType = "gmail"
  protected batchJobService_: BatchJobService
  protected gmailService_: GmailService
  protected eventBusService_: EventBusService

  constructor(container) {
    super(arguments[0])
    this.gmailService_ = container.gmailService
    this.batchJobService_ = container.batchJobService
    this.eventBusService_ = container.eventBusService
  }

  async processJob(batchJobId: string): Promise<void> {
    const batchJob = await this.batchJobService_.retrieve(batchJobId)
    const stream = await this.gmailService_.getGmailData(batchJob.context?.org as Organisation)
    stream.on('data', (documents) => {
      this.eventBusService_.emit(INDEX_DOCUMENT_EVENT, documents)
    });
    stream.on('end', () => {
      console.log('No more data');
    });
  }

  buildTemplate(): Promise<string> {
    throw new Error("Method not implemented.")
  }
}

export default GmailStrategy