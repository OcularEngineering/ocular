import { BatchJobService, Organisation, QueueService } from "@ocular/ocular";
import JiraService from "../services/jira";
import { INDEX_DOCUMENT_EVENT, APPS_INDEXING_TOPIC } from "@ocular/types";
import { AbstractBatchJobStrategy } from "@ocular/types";

export default class JiraStrategy extends AbstractBatchJobStrategy {
  static identifier = "jira-indexing-strategy";
  static batchType = "jira";
  protected batchJobService_: BatchJobService;
  protected jiraService_: JiraService;
  protected queueService_: QueueService;

  constructor(container) {
    super(arguments[0]);
    this.jiraService_ = container.jiraService;
    this.batchJobService_ = container.batchJobService;
    this.queueService_ = container.queueService;
  }

  async processJob(batchJobId: string): Promise<void> {
    const batchJob = await this.batchJobService_.retrieve(batchJobId);
    const stream = await this.jiraService_.getJiraData(
      // Confluenec method need to be implemmented
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
