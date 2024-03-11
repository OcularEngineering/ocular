import fs from 'fs';
import axios from 'axios';
import { Readable } from 'stream';
import { EntityManager } from "typeorm";
import { Octokit } from "@octokit/rest";
import { OAuthService, Organisation } from "@ocular-ai/core-backend";
import { IndexableDocument, TransactionBaseService, Logger, AppNameDefinitions  } from "@ocular-ai/types";
import { ConfigModule } from '@ocular-ai/core-backend/src/types';
import { App } from "octokit";


export default class AsanaService extends TransactionBaseService {
  protected oauthService_: OAuthService;
  protected logger_: Logger;
  protected container_: ConfigModule;

  constructor(container) {
    super(arguments[0]);
    this.oauthService_ = container.oauthService;
    this.logger_ = container.logger;
    this.container_ = container;
  }


  async getAsanaData(org: Organisation) {
    return Readable.from(this.getAsanaTasksAndProjects(org));
  }

  async *getAsanaTasksAndProjects(org: Organisation): AsyncGenerator<IndexableDocument[]> {
        this.logger_.info(`Starting oculation of Asana for ${org.id} organisation`);
        const oauth = await this.oauthService_.retrieve({id: org.id, app_name: AppNameDefinitions.ASANA});

        if (!oauth) {
          this.logger_.error(`No Asana OAuth found for ${org.id} organisation`);
          return;
        }

        let documents: IndexableDocument[] = [];
          try {
            const projects = await this.getAsanaProjects(oauth.token, oauth.last_sync.toISOString());
            for (const project of projects) {
              const tasks = await this.getAsanaTasks(oauth.token, project.gid,oauth.last_sync.toISOString());
              for (const task of tasks) {
                const doc: IndexableDocument = {
                  id: task.gid,
                  organisation_id: org.id,
                  title: task.name,
                  source: AppNameDefinitions.ASANA,
                  content: task.notes,
                  updated_at: new Date(task.modified_at),
                  location: `https://app.asana.com/0/${project.gid}/${task.gid}`,
                  metadata: JSON.stringify({ completed: task.completed }) 
                };
                documents.push(doc);
            }
            
             // Add Repository To Documents
             const projectDoc:IndexableDocument = {
              id: project.gid,
              organisation_id: org.id,
              title: project.name,
              source: AppNameDefinitions.ASANA,
              content: project.notes,
              updated_at: new Date(project.modified_at),
              location: `https://app.asana.com/0/${project.gid}`,
              metadata: JSON.stringify({ completed: project.completed }) 
            }
            documents.push(projectDoc);
          }
          await this.oauthService_.update(oauth.id, {last_sync: new Date()});
          yield documents;
          } catch (error) {
            if (error.response && error.response.status === 401) { // Check if it's an unauthorized error
              this.logger_.info(`Refreshing Asana token for ${org.id} organisation`);

              // Refresh the token
              const oauthToken = await this.container_["asanaOauth"].refreshToken(oauth.refresh_token);
        
              // Update the OAuth record with the new token
              await this.oauthService_.update(oauth.id, oauthToken);
        
              // Retry the request
              return this.getAsanaTasksAndProjects(org);
            } else {
              console.error(error);
            }
          }
          this.logger_.info(`Finished oculation of Asana for ${org.id} organisation`);
  }

  async getAsanaProjects (accessToken: string, datetime: string) {
    const response = await axios.get(`https://app.asana.com/api/1.0/projects?opt_expand=name,description,notes,completed,created_at`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    return response.data.data;
  };

  async getAsanaTasks(accessToken: string, projectId: string, datetime: string){
    const response = await axios.get(`https://app.asana.com/api/1.0/projects/${projectId}/tasks?opt_expand=name,description,notes,completed,created_at&modified_since=${datetime}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    return response.data.data;
  };

}
