
import { BatchJobService, Organisation, QueueService} from "@ocular/ocular"
import AsanaService from "../services/asana"
import { INDEX_DOCUMENT_EVENT, SEARCH_INDEXING_TOPIC } from "@ocular/types"
import { AbstractBatchJobStrategy } from "@ocular/types"

export default class AsanaStrategy extends AbstractBatchJobStrategy {
  static identifier = "asana-indexing-strategy"
  static batchType = "asana"
  protected batchJobService_: BatchJobService
  protected asanaService_: AsanaService
  protected queueService_: QueueService

  constructor(container) {
    super(arguments[0])
    this.asanaService_ = container.asanaService
    this.batchJobService_ = container.batchJobService
    this.queueService_ = container.queueService
  }

  async processJob(batchJobId: string): Promise<void> {
    const batchJob = await this.batchJobService_.retrieve(batchJobId)
    const stream = await this.asanaService_.getAsanaData(batchJob.context?.org as Organisation)
    stream.on('data', (documents) => {
      this.queueService_.sendBatch(SEARCH_INDEXING_TOPIC, documents)
    });
    stream.on('end', () => {
      console.log('No more data');
    });
  }

  buildTemplate(): Promise<string> {
    throw new Error("Method not implemented.")
  }
}