import { Readable } from 'stream';
import { EntityManager } from "typeorm";
import { Octokit } from "@octokit/rest";
import { OAuthService, Organisation } from "@ocular-ai/core-backend";
import { IndexableDocument, TransactionBaseService, Logger, AppNameDefinitions  } from "@ocular-ai/types";
import {OAuth2Client} from 'google-auth-library';
import { ConfigModule } from '@ocular-ai/core-backend/src/types';
import { App } from "octokit";
import fs from 'fs';
import { google } from 'googleapis';

export default class GoogleDriveService extends TransactionBaseService {
  protected oauthService_: OAuthService;
  protected logger_: Logger;
  protected container_: ConfigModule;

  constructor(container) {
    super(arguments[0]);
    this.oauthService_ = container.oauthService;
    this.logger_ = container.logger;
    this.container_ = container;
  }


  async getGoogleDriveData(org: Organisation) {
    return Readable.from(this.getGoogleDriveFiles(org));
  }

  async *getGoogleDriveFiles(org: Organisation): AsyncGenerator<IndexableDocument[]> {
      this.logger_.info(`Starting oculation of Google Drive for ${org.id} organisation`);
      const oauth = await this.oauthService_.retrieve({id: org.id, app_name: AppNameDefinitions.GOOGLEDRIVE});
      let documents: IndexableDocument[] = [];

      if (!oauth) {
        this.logger_.error(`No Google Drive OAuth Cred found for ${org.id} organisation`);
        return;
      }
      let last_sync = ''
      if(oauth.last_sync!==null){
        last_sync =  oauth.last_sync.toISOString();
      }

      const oauth2Client:OAuth2Client = await this.container_[`${AppNameDefinitions.GOOGLEDRIVE}Oauth`].getOauthCLient();
      oauth2Client.setCredentials({ access_token: oauth.token, refresh_token: oauth.refresh_token});

      const drive = await google.drive({ version: 'v3', auth: oauth2Client });
  
      // Currently Gets Docs Only But Needs To Be Extended To Get All Files Like Videos, Slides Etc
      try {

        // Only Sync Files Modified After Last Sync
        let query = "mimeType='application/vnd.google-apps.document'";
        if (last_sync !== '') {
          query += ` and modifiedTime > '${last_sync}'`;
        }
        const {data} = await drive.files.list({
          q: query,
          fields: 'files(id,name,modifiedTime,webViewLink)'
        });

        // Export Each File As Plain Text
        for (const file of data.files) {
          // Export the Google Docs file as plain text
          let content = await new Promise<string>((resolve, reject) => {
            let data = '';
            drive.files.export({
              fileId: file.id,
              mimeType: 'text/plain'
            }, {responseType: 'stream'})
            .then(response => {
              response.data
                .on('data', chunk => data += chunk)
                .on('end', () => resolve(data))
                .on('error', reject);
            })
            .catch(reject);
          });

          const doc: IndexableDocument = {
            id: file.id,
            organisation_id: org.id,
            title: file.name,
            source: AppNameDefinitions.GOOGLEDRIVE,
            content:  content,
            updated_at: new Date(file.modifiedTime),
            location: file.webViewLink,
          };
          console.log(doc)
          documents.push(doc);
        }
        await this.oauthService_.update(oauth.id, {last_sync: new Date()});
        yield documents;
      } catch (error) {

        if (error.response && error.response.status === 401) { // Check if it's an unauthorized error
          this.logger_.info(`Refreshing Asana token for ${org.id} organisation`);

          // Refresh the token
          const oauthToken = await this.container_["google-driveOauth"].refreshToken(oauth.refresh_token);
    
          // Update the OAuth record with the new token
          await this.oauthService_.update(oauth.id, oauthToken);
    
          // Retry the request
          return this.getGoogleDriveFiles(org);
        } else {
          console.error(error);
        }

        console.log(error)
        console.error('The API returned an error: ' + error);
        return null;
      }
      this.logger_.info(`Finished oculation of Github for ${org.id} organisation`);
  }
}