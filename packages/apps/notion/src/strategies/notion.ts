import { BatchJobService, Organisation, QueueService } from '@ocular/ocular';
import AsanaService from '../services/notion';
import { INDEX_DOCUMENT_EVENT, SEARCH_INDEXING_TOPIC } from '@ocular/types';
import { AbstractBatchJobStrategy } from '@ocular/types';

export default class AsanaStrategy extends AbstractBatchJobStrategy {
  static identifier = 'notion-indexing-strategy';
  static batchType = 'notion';
  protected batchJobService_: BatchJobService;
  protected asanaService_: AsanaService;
  protected queueService_: QueueService;

  constructor(container) {
    super(arguments[0]);
    this.asanaService_ = container.asanaService;
    this.batchJobService_ = container.batchJobService;
    this.queueService_ = container.queueService;
  }

  async processJob(batchJobId: string): Promise<void> {
    const batchJob = await this.batchJobService_.retrieve(batchJobId);
    const stream = await this.asanaService_.getNotionPagesData(
      batchJob.context?.org as Organisation
    );
    stream.on('data', (documents) => {
      for (const document of documents) {
        this.queueService_.send(SEARCH_INDEXING_TOPIC, document)
      }
    });
    stream.on('end', () => {
      console.log('No more data');
    });
  }

  buildTemplate(): Promise<string> {
    throw new Error('Method not implemented.');
  }
}
