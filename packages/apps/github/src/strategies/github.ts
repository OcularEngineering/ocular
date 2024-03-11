import {AbstractBatchJobStrategy } from "@ocular-ai/core-backend/dist/core-backend/src/interfaces"
import { BatchJobService, Organisation, EventBusService } from "@ocular-ai/core-backend"
import { EntityManager } from "typeorm"
import GitHubService from "../services/github"
import JobSchedulerService from "@ocular-ai/core-backend"
import e from "express"
import { INDEX_DOCUMENT_EVENT } from "@ocular-ai/types"

// async scheduleJob<T>(
//   eventName: string,
//   data: T,
//   schedule: string,
//   options?: CreateJobOptions
// ): Promise<Job> {

class GithubStrategy extends AbstractBatchJobStrategy {
  static identifier = "github-indexing-strategy"
  static batchType = "github"
  protected batchJobService_: BatchJobService
  protected githubService_: GitHubService
  protected eventBusService_: EventBusService

  constructor(container) {
    super(arguments[0])
    this.githubService_ = container.githubService
    this.batchJobService_ = container.batchJobService
    this.eventBusService_ = container.eventBusService
  }

  async processJob(batchJobId: string): Promise<void> {
    console.log("Processing Github Indexing Job", batchJobId)

    // const batchJob = await this.batchJobService_.retrieve(batchJobId)

    // const stream = await this.githubService_.getRepositoriesOcular(batchJob.context?.org as Organisation)

    // stream.on('data', (documents) => {
    //   this.eventBusService_.emit(INDEX_DOCUMENT_EVENT, documents)
    // });


    // stream.on('end', () => {
    //   console.log('No more data');
    // });
  }

  buildTemplate(): Promise<string> {
    throw new Error("Method not implemented.")
  }

  protected manager_: EntityManager
  protected transactionManager_: EntityManager

}

export default GithubStrategy