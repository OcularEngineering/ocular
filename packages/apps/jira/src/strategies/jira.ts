import { BatchJobService, Organisation, QueueService } from "@ocular/ocular";
import JiraService from "../services/jira";
import {
  INDEX_DOCUMENT_EVENT,
  APPS_INDEXING_TOPIC,
  Logger,
  AbstractBatchJobStrategy,
} from "@ocular/types";

export default class JiraStrategy extends AbstractBatchJobStrategy {
  static identifier = "jira-indexing-strategy";
  static batchType = "jira";
  protected batchJobService_: BatchJobService;
  protected jiraService_: JiraService;
  protected queueService_: QueueService;
  protected logger_: Logger;

  constructor(container) {
    super(arguments[0]);
    this.jiraService_ = container.jiraService;
    this.batchJobService_ = container.batchJobService;
    this.queueService_ = container.queueService;
    this.logger_ = container.logger;
  }

  async processJob(batchJobId: string): Promise<void> {
    const batchJob = await this.batchJobService_.retrieve(batchJobId);

    const org = batchJob.context?.org as Organisation;
    const oculationJiraActivity = this.logger_.activity(
      `processJob: Oculating Jira Data for organisation: ${org.id} name: ${org.name}`
    );
    const stream = await this.jiraService_.getJiraData(org);

    stream.on("data", (documents) => {
      this.queueService_.sendBatch(APPS_INDEXING_TOPIC, documents);
    });

    stream.on("end", () => {
      this.logger_.success(
        oculationJiraActivity,
        `processJob:Finished oculation of Jira Data for ${org.id} organisation`
      );
    });
    stream.on("end", () => {
      this.logger_.error(
        oculationJiraActivity,
        `processJob:Error in oculation of Jira Data for ${org.id} organisation`
      );
    });
  }

  buildTemplate(): Promise<string> {
    throw new Error("Method not implemented.");
  }
}
