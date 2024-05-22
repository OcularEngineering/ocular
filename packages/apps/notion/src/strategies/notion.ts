import { BatchJobService, Organisation, QueueService } from "@ocular/ocular";
import NotionService from "../services/notion";
import { INDEX_DOCUMENT_EVENT, APPS_INDEXING_TOPIC } from "@ocular/types";
import { AbstractBatchJobStrategy } from "@ocular/types";

export default class NotionStrategy extends AbstractBatchJobStrategy {
  static identifier = "notion-indexing-strategy";
  static batchType = "notion";
  protected batchJobService_: BatchJobService;
  protected notionService_: NotionService;
  protected queueService_: QueueService;

  constructor(container) {
    super(arguments[0]);
    this.notionService_ = container.notionService;
    this.batchJobService_ = container.batchJobService;
    this.queueService_ = container.queueService;
  }

  async processJob(batchJobId: string): Promise<void> {
    const batchJob = await this.batchJobService_.retrieve(batchJobId);
    const stream = await this.notionService_.getNotionPagesData(
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
