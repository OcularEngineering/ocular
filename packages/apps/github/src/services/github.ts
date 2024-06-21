import { Readable } from "stream";
import { EntityManager } from "typeorm";
import { Octokit } from "@octokit/rest";
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
} from "@ocular/types";
import { ConfigModule } from "@ocular/ocular/src/types";
import fs from "fs";
import e from "express";
import { RateLimiterQueue } from "rate-limiter-flexible";

export default class GitHubService extends TransactionBaseService {
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
      AppNameDefinitions.GITHUB
    );
  }

  async getRepositoriesOcular(org: Organisation) {
    return Readable.from(this.getGitHubRepositories(org));
  }

  async *getGitHubRepositories(
    org: Organisation
  ): AsyncGenerator<IndexableDocument[]> {
    // Check if the Auth record exists for this App in this Organisation.
    const auth = await this.appAuthorizationService_.retrieve({
      id: org.id,
      app_name: AppNameDefinitions.GITHUB,
    });

    if (!auth) {
      this.logger_.error(
        `getGitHubRepositories: No Github Auth Cred found for ${org.id} organisation`
      );
      return;
    }

    if (!auth.metadata.organisation || !auth.metadata.repository) {
      this.logger_.error(
        `getGitHubRepositories: No Github Repository or Organization found ${org.id} organisation`
      );
      return;
    }

    // Get the last sync date - this is the time the latest document that was synced from Gmail.
    let last_sync = "";
    if (auth.last_sync !== null) {
      last_sync = auth.last_sync.toISOString();
    }

    // Array storing the processed documents
    let documents: IndexableDocument[] = [];

    try {
      // Instantiate the GitHub Client
      const octokit = new Octokit({
        auth: auth.token,
      });
      // Block Until Rate Limit Allows Request
      // await this.requestQueue_.removeTokens(1, AppNameDefinitions.GITHUB);
      // Get Data From From Front End
      const { data } = await octokit.rest.repos.get({
        owner: auth.metadata.organisation as string,
        repo: auth.metadata.repository as string,
      });
      const repoMetadata = {
        name: data.name,
        description: data.description,
        html_url: data.html_url,
        updated_at: data.updated_at,
      };

      // Get Commits For This Repository
      // Block Until Rate Limit Allows Request
      // await this.requestQueue_.removeTokens(1, AppNameDefinitions.GITHUB);
      const prs = await octokit.rest.pulls.list({
        owner: "OcularEngineering",
        repo: "ocular",
        state: "all",
        sort: "updated",
        direction: "desc",
        since: last_sync === "" ? undefined : last_sync,
      });

      const prsWithAuthor = await prs.data.map((pr) => ({
        ...pr,
        author: pr.user.login,
      }));

      for (const pr of prsWithAuthor) {
        const doc: IndexableDocument = {
          id: String(pr.id),
          organisationId: org.id,
          title: pr.title,
          source: AppNameDefinitions.GITHUB,
          sections: [
            {
              link: pr.html_url,
              content: pr.body,
            },
          ],
          type: DocType.TXT,
          updatedAt: new Date(pr.updated_at),
          metadata: {
            repo: repoMetadata,
            pull_request: {
              state: pr.state,
              author_name: pr.user.login,
              author_avatar: pr.user.avatar_url,
              author_url: pr.user.html_url,
            },
          },
        };
        documents.push(doc);
        if (documents.length >= 100) {
          yield documents;
          documents = [];
        }
      }

      const issues = await octokit.rest.issues.list({
        owner: "OcularEngineering",
        repo: "ocular",
        state: "all",
        sort: "updated",
        direction: "desc",
        since: last_sync === "" ? undefined : last_sync,
      });

      const issuesWithAuthor = await issues.data.map((issue) => ({
        ...issue,
        author: issue.user.login,
      }));

      for (const issue of issuesWithAuthor) {
        const doc: IndexableDocument = {
          id: String(issue.id),
          organisationId: org.id,
          title: issue.title,
          source: AppNameDefinitions.GITHUB,
          sections: [
            {
              link: issue.html_url,
              content: issue.body,
            },
          ],
          type: DocType.TXT,
          updatedAt: new Date(issue.updated_at),
          metadata: {
            repo: repoMetadata,
            issue: {
              state: issue.state,
              author_name: issue.user.login,
              author_avatar: issue.user.avatar_url,
              author_url: issue.user.html_url,
            },
          },
        };
        documents.push(doc);
        if (documents.length >= 100) {
          yield documents;
          documents = [];
        }
      }
      await this.appAuthorizationService_.update(auth.id, {
        last_sync: new Date(),
      });
      yield documents;
    } catch (error) {
      this.logger_.error(
        `getGitHubRepositories: Error fetching Slack data for ${org.id} organisation`,
        error
      );
      throw error;
    }
  }
}
