import { Readable } from 'stream';
import { EntityManager } from "typeorm";
import { Octokit } from "@octokit/rest";
import { OAuthService, Organisation } from "@ocular-ai/core-backend";
import { IndexableDocument, TransactionBaseService, Logger, AppNameDefinitions  } from "@ocular-ai/types";
// import { Config } from 'prettier';
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

  async *getGitHubRepositories(org: Organisation): AsyncGenerator<IndexableDocument[]> {
        this.logger_.info(`Starting oculation of Github for ${org.id} organisation`);

        const app = new App({
          appId: 828718,
          privateKey: fs.readFileSync("/Users/louismurerwa/Downloads/ocular-ai.2024-02-18.private-key.pem", "utf-8") // replace with your private key path,
        });

        let documents: IndexableDocument[] = [];
        for (const installedApp of org.installed_apps) {
          if (installedApp.name !== AppNameDefinitions.GITHUB) continue;
          const installationId = installedApp.installation_id;
          const octokit = await app.getInstallationOctokit(Number(installationId));
  
          try {
            const { data } = await octokit.rest.apps.listReposAccessibleToInstallation();
            for (const repo of data.repositories) {
              // Get Commits For This Repository
              const prs = await octokit.rest.pulls.list({
                owner: repo.owner.login,
                repo: repo.name,
                state: 'all'
              })
              for(const pr of prs.data) {
                const doc: IndexableDocument = {
                  id: String(pr.id),
                  organisation_id: org.id,
                  title: pr.title,
                  source: AppNameDefinitions.GITHUB,
                  content: pr.body,
                  updated_at: new Date(pr.updated_at),
                  location: pr.html_url,
                  metadata: JSON.stringify({ state: pr.state }) 
                };
                documents.push(doc);
              }

              // Get Issues For This Repository
              const issues = await octokit.rest.issues.list({
                owner: repo.owner.login,
                repo: repo.name,
                state: 'all'
              })
              for(const issue of issues.data) {
                const doc: IndexableDocument = {
                  id: String(issue.id),
                  organisation_id: org.id, // replace with actual org_id
                  title: issue.title,
                  source: AppNameDefinitions.GITHUB,
                  content: issue.body,
                  updated_at: new Date(issue.updated_at),
                  location: issue.html_url,
                  metadata: JSON.stringify({ state: issue.state }) 
                };
              documents.push(doc);
            }

            // Add Repository To Documents
            const repoDoc:IndexableDocument = {
              id: String(repo.id),
              organisation_id: org.id,
              title: repo.name,
              content: repo.description,
              source: AppNameDefinitions.GITHUB,
              updated_at: new Date(repo.updated_at),
              location: repo.html_url
              // Generate Embeddings Here
              // GenerateEmbeddings
            }
            documents.push(repoDoc); 
            }
            yield documents;
          } catch (error) {
            console.error(error);
          }
        }
      this.logger_.info(`Finished oculation of Github for ${org.id} organisation`);
  }
}