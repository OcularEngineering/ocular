import fs from "fs";
import axios from "axios";
import { Readable } from "stream";
import { OAuthService, Organisation, RateLimiterService } from "@ocular/ocular";
import {
  IndexableDocument,
  DocType,
  TransactionBaseService,
  Logger,
  AppNameDefinitions,
} from "@ocular/types";
import { ConfigModule } from "@ocular/ocular/src/types";
import { RateLimiterQueue } from "rate-limiter-flexible";

export default class AsanaService extends TransactionBaseService {
  protected oauthService_: OAuthService;
  protected logger_: Logger;
  protected container_: ConfigModule;
  protected rateLimiterService_: RateLimiterService;
  protected requestQueue_: RateLimiterQueue;

  constructor(container) {
    super(arguments[0]);
    this.oauthService_ = container.oauthService;
    this.logger_ = container.logger;
    this.container_ = container;
    this.rateLimiterService_ = container.rateLimiterService;
    this.requestQueue_ = this.rateLimiterService_.getRequestQueue(
      AppNameDefinitions.ASANA
    );
  }

  async getAsanaData(org: Organisation) {
    return Readable.from(this.getAsanaTasksAndProjects(org));
  }

  async *getAsanaTasksAndProjects(
    org: Organisation
  ): AsyncGenerator<IndexableDocument[]> {
    this.logger_.info(`Starting oculation of Asana for ${org.id} organisation`);
    // Get Asana OAuth for the organisation
    const oauth = await this.oauthService_.retrieve({
      id: org.id,
      app_name: AppNameDefinitions.ASANA,
    });
    if (!oauth) {
      this.logger_.error(`No Asana OAuth found for ${org.id} organisation`);
      return;
    }

    console.log("OAUTH", oauth);
    // Get the last sync date - this is the time the latest document that was synced from Google Drive.
    let last_sync = "";
    if (oauth.last_sync !== null) {
      last_sync = oauth.last_sync.toISOString();
    }

    let documents: IndexableDocument[] = [];
    try {
      // const projects = await this.getAsanaProjects(oauth.token, last_sync);
      // for (const project of projects) {
      //   const tasks = await this.getAsanaTasks(
      //     oauth.token,
      //     project.gid,
      //     last_sync
      //   );
      //   for (const task of tasks) {
      //     const doc: IndexableDocument = {
      //       id: task.gid,
      //       organisationId: org.id,
      //       title: task.name,
      //       source: AppNameDefinitions.ASANA,
      //       sections: [
      //         {
      //           link: `https://app.asana.com/0/${project.gid}/${task.gid}`,
      //           content: task.notes,
      //         },
      //       ],
      //       type: DocType.TXT,
      //       updatedAt: new Date(task.modified_at),
      //       metadata: {
      //         completed: task.completed,
      //         project_id: project.gid,
      //         project_name: project.name,
      //         project_link: `https://app.asana.com/api/1.0/projects/${project.gid}`,
      //       },
      //     };
      //     documents.push(doc);
      //     if (documents.length >= 100) {
      //       yield documents;
      //       documents = [];
      //     }
      //   }
      // }
      // yield documents;
      await this.oauthService_.update(oauth.id, { last_sync: new Date() });
    } catch (error) {
      // if (error.response && error.response.status === 401) {
      //   // Check if it's an unauthorized error
      //   this.logger_.info(`Refreshing Asana token for ${org.id} organisation`);

      //   // Refresh the token
      //   const oauthToken = await this.container_["asanaOauth"].refreshToken(
      //     oauth.refresh_token
      //   );

      //   // Update the OAuth record with the new token
      //   await this.oauthService_.update(oauth.id, oauthToken);

      //   // Retry the request
      //   return this.getAsanaTasksAndProjects(org);
      // } else {
      console.error(error);
      // }
    }
    this.logger_.info(`Finished oculation of Asana for ${org.id} organisation`);
  }

  // Get Asana Projects

  async getAsanaProjects(accessToken: string, datetime: string) {
    // Block Until Rate Limit Allows Request
    await this.requestQueue_.removeTokens(1, AppNameDefinitions.ASANA);
    const response = await axios.get(
      `https://app.asana.com/api/1.0/projects?opt_expand=name,description,notes,completed,created_at`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data.data;
  }

  // Get Asana Tasks

  async getAsanaTasks(
    accessToken: string,
    projectId: string,
    datetime: string
  ) {
    // Block Until Rate Limit Allows Request
    await this.requestQueue_.removeTokens(1, AppNameDefinitions.ASANA);
    let url = `https://app.asana.com/api/1.0/projects/${projectId}/tasks?opt_expand=name,description,notes,completed,created_at`;
    if (datetime) {
      url += `&modified_since=${datetime}`;
    }
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data.data;
  }
}
