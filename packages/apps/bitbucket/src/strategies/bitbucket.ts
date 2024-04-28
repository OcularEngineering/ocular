import { BatchJobService, Organisation, EventBusService } from '@ocular/ocular';
import BitBucketService from '../services/bitbucket';
import { INDEX_DOCUMENT_EVENT } from '@ocular/types';
import { AbstractBatchJobStrategy } from '@ocular/types';

export default class BitBucketStrategy extends AbstractBatchJobStrategy {
  static identifier = 'bitbucket-indexing-strategy';
  static batchType = 'bitbucket';
  protected batchJobService_: BatchJobService;
  protected bitbucketService_: BitBucketService;
  protected eventBusService_: EventBusService;

  constructor(container) {
    super(arguments[0]);
    this.bitbucketService_ = container.bitbucketService;
    this.batchJobService_ = container.batchJobService;
    this.eventBusService_ = container.eventBusService;
  }

  async processJob(batchJobId: string): Promise<void> {
    const batchJob = await this.batchJobService_.retrieve(batchJobId);
    const stream = await this.bitbucketService_.getBitBucketData(
      batchJob.context?.org as Organisation
    );
    stream.on('data', (documents) => {
      this.eventBusService_.emit(INDEX_DOCUMENT_EVENT, documents);
    });
    stream.on('end', () => {
      console.log('No more data');
    });
  }

  buildTemplate(): Promise<string> {
    throw new Error('Method not implemented.');
  }
}
