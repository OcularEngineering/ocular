import { Readable } from 'stream';
import { EntityManager } from "typeorm";
import { App } from "octokit";
import { OAuthService, Organisation } from "@ocular/ocular";
import { IndexableDocument, TransactionBaseService, Logger, AppNameDefinitions, DocType  } from "@ocular/types";
import { ConfigModule } from "@ocular/ocular/src/types";;
import fs from 'fs';
import e from 'express';

export default class GitHubService extends TransactionBaseService {
  protected oauthService_: OAuthService;
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

      // Check if the OAuth record exists for this App in this Organisation.
      const oauth = await this.oauthService_.retrieve({id: org.id, app_name: AppNameDefinitions.GITHUB});
      if (!oauth) {
        this.logger_.error(`No Github OAuth Cred found for ${org.id} organisation`);
        return;
      }

    
      // Get the last sync date - this is the time the latest document that was synced from Gmail.
      let last_sync = ''
      if( oauth.last_sync !==null ){
        last_sync =  oauth.last_sync.toISOString();
      }

      // Array storing the processed documents
      let documents: IndexableDocument[] = [];

      const privateKey = fs.readFileSync(process.env.GITHUB_PRIVATE_KEY_PATH, 'utf-8');
      const app = new App({ appId: process.env.GITHUB_APP_ID, privateKey: privateKey });
      
      const octokit = await app.getInstallationOctokit(Number(oauth.metadata.installation_id));
      try {
        const { data } = await octokit.rest.apps.listReposAccessibleToInstallation();

        for (const repo of data.repositories) {
          console.log(repo.name);
          console.log(repo.owner);
          // Get Commits For This Repository
          const prs = await octokit.rest.pulls.list({
            owner: repo.owner.login,
            repo: repo.name,
            state: 'all',
            sort: 'updated',
            direction: 'desc',
            since: last_sync === "" ? undefined : last_sync
          })
          for(const pr of prs.data) {
            const doc: IndexableDocument = {
              id: String(pr.id),
              organisationId: org.id,
              title: pr.title,
              source: AppNameDefinitions.GITHUB,
              sections: [{
                link : pr.html_url,
                content: pr.body
              }],
              type: DocType.TEXT,
              updatedAt: new Date(pr.updated_at),
              metadata: { state: pr.state } 
            };
            documents.push(doc);
            if (documents.length >= 100) {
              yield documents;
              documents = [];
            }
          }

          // Get Issues For This Repository
          const issues = await octokit.rest.issues.listForRepo({
            owner: repo.owner.login,
            repo: repo.name,
            state: 'all',
            sort: 'updated',
            direction: 'desc',
            since: last_sync === "" ? undefined : last_sync
          })
          for(const issue of issues.data) {
            const doc: IndexableDocument = {
              id: String(issue.id),
              organisationId: org.id,
              title: issue.title,
              source: AppNameDefinitions.GITHUB,
              sections: [{
                link :  issue.html_url,
                content: issue.body
              }],
              type: DocType.TEXT,
              updatedAt: new Date(issue.updated_at),
              metadata: { state: issue.state } 
            };
            if (documents.length >= 100) {
              yield documents;
              documents = [];
            }
            documents.push(doc);
        }
        // Add Repository To Documents
        const repoDoc:IndexableDocument = {
          id: String(repo.id),
          organisationId: org.id,
          title: repo.name,
          sections: [{
            link :  repo.html_url,
            content: repo.description,
          }],
          type: DocType.TEXT,
          source: AppNameDefinitions.GITHUB,
          updatedAt: new Date(repo.updated_at),
          metadata: {}
        }
        documents.push(repoDoc); 
        }
        await this.oauthService_.update(oauth.id, {last_sync: new Date()});
        yield documents;
      } catch (error) {
        console.error(error);
      }
        
      this.logger_.info(`Finished oculation of Github for ${org.id} organisation`);
  }
}