import { BatchJobService, Organisation, QueueService } from "@ocular/ocular";
import NotionService from "../services/notion";
import {
  INDEX_DOCUMENT_EVENT,
  APPS_INDEXING_TOPIC,
  Logger,
  AbstractBatchJobStrategy,
} from "@ocular/types";

export default class NotionStrategy extends AbstractBatchJobStrategy {
  static identifier = "notion-indexing-strategy";
  static batchType = "notion";
  protected batchJobService_: BatchJobService;
  protected notionService_: NotionService;
  protected queueService_: QueueService;
  protected logger_: Logger;

  constructor(container) {
    super(arguments[0]);
    this.notionService_ = container.notionService;
    this.batchJobService_ = container.batchJobService;
    this.queueService_ = container.queueService;
    this.logger_ = container.logger;
  }

  async processJob(batchJobId: string): Promise<void> {
    const batchJob = await this.batchJobService_.retrieve(batchJobId);
    const org = batchJob.context?.org as Organisation;
    // Start Tracking The Activity of The Indexing Process
    const oculationNotionPagesActivity = this.logger_.activity(
      `processJob: Oculating Notion Data for organisation: ${org.id} name: ${org.name}`
    );

    const stream = await this.notionService_.notionIndexableDocuments(org);
    stream.on("data", (documents) => {
      this.queueService_.sendBatch(APPS_INDEXING_TOPIC, documents);
    });

    // Log The End of The Indexing Process
    stream.on("end", () => {
      this.logger_.success(
        oculationNotionPagesActivity,
        `processJob:Starting oculation of Notion Pages for ${org.id} organisation`
      );
    });

    // Log The Error of The Indexing Process
    stream.on("end", () => {
      this.logger_.error(
        oculationNotionPagesActivity,
        `processJob:Starting oculation of Notion Pages for ${org.id} organisation`
      );
    });
  }

  buildTemplate(): Promise<string> {
    throw new Error("Method not implemented.");
  }
}
