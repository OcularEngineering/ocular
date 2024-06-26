import { Readable } from "stream";
import {
  AppAuthorizationService,
  Organisation,
  RateLimiterService,
} from "@ocular/ocular";
import {
  IndexableDocument,
  TransactionBaseService,
  Logger,
  AppNameDefinitions,
  DocType,
  AuthStrategy,
} from "@ocular/types";
import { ConfigModule } from "@ocular/ocular/src/types";
import { RateLimiterQueue } from "rate-limiter-flexible";
import ApiTokenService from "../utils/api-token-service";

export default class JiraService extends TransactionBaseService {
  protected appAuthorizationService_: AppAuthorizationService;
  protected logger_: Logger;
  protected container_: ConfigModule;
  protected rateLimiterService_: RateLimiterService;
  protected requestQueue_: RateLimiterQueue;

  constructor(container) {
    super(arguments[0]);
    this.appAuthorizationService_ = container.appAuthorizationService;
    this.logger_ = container.logger;
    this.container_ = container;
    this.rateLimiterService_ = container.rateLimiterService;
    this.requestQueue_ = this.rateLimiterService_.getRequestQueue(
      AppNameDefinitions.JIRA
    );
  }

  async getJiraData(org: Organisation) {
    return Readable.from(this.getJiraProjectsAndIssues(org));
  }

  async *getJiraProjectsAndIssues(
    org: Organisation
  ): AsyncGenerator<IndexableDocument[]> {
    // Get Confluence auth for the organisation
    const auth = await this.appAuthorizationService_.retrieve({
      id: org.id,
      app_name: AppNameDefinitions.JIRA,
    });

    if (!auth) {
      this.logger_.error(`No Jira auth found for ${org.id} organisation`);
      return;
    }

    let documents: IndexableDocument[] = [];

    try {
      if (auth.auth_strategy === AuthStrategy.API_TOKEN_STRATEGY) {
        const apiTokenService = new ApiTokenService(
          auth.token,
          auth.metadata.domain_name as string,
          auth.metadata.user_name as string,
          org,
          this.logger_,
          this.rateLimiterService_,
          auth.last_sync
        );

        const projectIndexableDocs = await apiTokenService.jiraIndexDocs();

        for (const doc of projectIndexableDocs) {
          documents.push(doc);
          if (documents.length >= 100) {
            yield documents;
            documents = [];
          }
        }
        yield documents;
      }

      await this.appAuthorizationService_.update(auth.id, {
        last_sync: new Date(),
      });
    } catch (error) {
      this.logger_.error(
        `getJiraProjectsAndIssues: Error fetching Jira data for ${org.id} organisation: ${error}`
      );
    }
  }
}
