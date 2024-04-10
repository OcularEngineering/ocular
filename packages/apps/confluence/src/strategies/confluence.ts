import { BatchJobService, Organisation, EventBusService } from '@ocular/ocular';
import ConfluenceService from '../services/confluence';
import { INDEX_DOCUMENT_EVENT } from '@ocular/types';
import { AbstractBatchJobStrategy } from '@ocular/types';

export default class ConfluenceStrategy extends AbstractBatchJobStrategy {
  static identifier = 'confluence-indexing-strategy';
  static batchType = 'confluence';
  protected batchJobService_: BatchJobService;
  protected confluenceService_: ConfluenceService;
  protected eventBusService_: EventBusService;

  constructor(container) {
    super(arguments[0]);
    this.confluenceService_ = container.confluenceService;
    this.batchJobService_ = container.batchJobService;
    this.eventBusService_ = container.eventBusService;
  }

  async processJob(batchJobId: string): Promise<void> {
    const batchJob = await this.batchJobService_.retrieve(batchJobId);
    const stream = await this.confluenceService_.getConfluenceData(
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
