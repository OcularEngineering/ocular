import {AbstractBatchJobStrategy } from "@ocular-ai/core-backend/dist/core-backend/src/interfaces"
import { BatchJobService, Organisation, EventBusService } from "@ocular-ai/core-backend"
import { EntityManager } from "typeorm"
import GoogleDriveService from "../services/google-drive"
import JobSchedulerService from "@ocular-ai/core-backend"
import e from "express"
import { INDEX_DOCUMENT_EVENT } from "@ocular-ai/types"

class GoogleDriveStrategy extends AbstractBatchJobStrategy {
  static identifier = "google-drive-indexing-strategy"
  static batchType = "google-drive"
  protected batchJobService_: BatchJobService
  protected googleDriveService_: GoogleDriveService
  protected eventBusService_: EventBusService

  constructor(container) {
    super(arguments[0])
    this.googleDriveService_ = container.googleDriveService
    this.batchJobService_ = container.batchJobService
    this.eventBusService_ = container.eventBusService
  }

  async processJob(batchJobId: string): Promise<void> {
    const batchJob = await this.batchJobService_.retrieve(batchJobId)
    const stream = await this.googleDriveService_.getGoogleDriveData(batchJob.context?.org as Organisation)
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

export default GoogleDriveStrategy