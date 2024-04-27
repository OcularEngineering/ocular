import { BatchJobService, Organisation, QueueService } from '@ocular/ocular';
import SlackService from '../services/slack';
import { INDEX_DOCUMENT_EVENT, SEARCH_INDEXING_TOPIC } from '@ocular/types';
import { AbstractBatchJobStrategy } from '@ocular/types';

export default class SlackStrategy extends AbstractBatchJobStrategy {
  static identifier = 'slack-indexing-strategy';
  static batchType = 'slack';
  protected batchJobService_: BatchJobService;
  protected slackService_: SlackService;
  protected queueService_: QueueService;

  constructor(container) {
    super(arguments[0]);
    this.slackService_ = container.slackService;
    this.batchJobService_ = container.batchJobService;
    this.queueService_ = container.queueService;
  }

  async processJob(batchJobId: string): Promise<void> {
    const batchJob = await this.batchJobService_.retrieve(batchJobId);
    const stream = await this.slackService_.getSlackData(
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
