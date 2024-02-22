import { Readable } from 'stream';
import { EntityManager } from "typeorm";
import { Octokit } from "@octokit/rest";
import { OAuthService, Organisation } from "@ocular-ai/core-backend";
import { IndexableDocument, TransactionBaseService, Logger, AppNameDefinitions  } from "@ocular-ai/types";
import { Config } from 'prettier';
import { ConfigModule } from '@ocular-ai/core-backend/src/types';
import { App } from "octokit";
import fs from 'fs';

export default class GitHubService extends TransactionBaseService {
  protected oauthService_: typeof OAuthService;
  protected logger_: Logger;
  protected container_: ConfigModule;

  constructor(container) {
    super(arguments[0]);
    this.oauthService_ = container.oauthService;
    this.logger_ = container.logger;
    this.container_ = container;
  }


  async getRepositoriesOcular(org: Organisation) {
    return Readable.from(this.getGitHubRepositories(org));
  }

  async *getGitHubRepositories(org: Organisation): AsyncGenerator<IndexableDocument> {
        this.logger_.info(`Starting oculation of Github for ${org.id} organisation`);

        const app = new App({
          appId: 3443,
          privateKey: fs.readFileSync("/Users/louismurerwa/Downloads/ocular-ai.2024-02-18.private-key.pem", "utf-8") // replace with your private key path,
        });

        for (const installedApp of org.installed_apps) {
          if (installedApp.name !== AppNameDefinitions.GITHUB) continue;
          const installationId = installedApp.installation_id;
          const octokit = await app.getInstallationOctokit(Number(installationId));
  
          try {
            const { data } = await octokit.rest.apps.listReposAccessibleToInstallation();
            for (const repo of data.repositories) {
              yield {
                id: String(repo.id),
                organisation_id: org.id,
                title: repo.name,
                source: AppNameDefinitions.GITHUB,
                updated_at: new Date(repo.updated_at),
                location: repo.html_url
              } as IndexableDocument; 
            }
          } catch (error) {
            console.error(error);
          }
        }
      this.logger_.info('Finished oculation of core users');
  }
}