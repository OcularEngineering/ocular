import { Readable } from 'stream';
import { EntityManager } from "typeorm";
import { OAuthService, Organisation } from "@ocular/ocular";
import { IndexableDocument, TransactionBaseService, Logger, AppNameDefinitions, DocType  } from "@ocular/types";
import {OAuth2Client} from 'google-auth-library';
import { ConfigModule } from '@ocular/ocular/src/types';
import fs from 'fs';
import { google } from 'googleapis';

export default class GmailService extends TransactionBaseService {
  protected oauthService_: OAuthService;
  protected logger_: Logger;
  protected container_: ConfigModule;

  constructor(container) {
    super(arguments[0]);
    this.oauthService_ = container.oauthService;
    this.logger_ = container.logger;
    this.container_ = container;
  }


  async getGmailData(org: Organisation) {
    return Readable.from(this.getGmailFiles(org));
  }

  async *getGmailFiles(org: Organisation): AsyncGenerator<IndexableDocument[]> {
      this.logger_.info(`Starting oculation of Gmail for ${org.id} organisation`);

      // Check if the OAuth record exists for this App in this Organisation.
      const oauth = await this.oauthService_.retrieve({id: org.id, app_name: AppNameDefinitions.GMAIL});
      if (!oauth) {
        this.logger_.error(`No Gmail OAuth Cred found for ${org.id} organisation`);
        return;
      }

      // Get the last sync date - this is the time the latest document that was synced from Gmail.
      let last_sync = ''
      if( oauth.last_sync !==null ){
        last_sync =  oauth.last_sync.toISOString();
      }

      // Get the OAuth2Client for the Gmail App and set the credentials.
      const oauth2Client:OAuth2Client = await this.container_[`${AppNameDefinitions.GMAIL}Oauth`].getOauthCLient();
      oauth2Client.setCredentials({ access_token: oauth.token, refresh_token: oauth.refresh_token});
      const gmail = google.gmail({version: 'v1', auth: oauth2Client});

      let documents: IndexableDocument[] = [];
      try {
       // Only Sync Files Modified After Last Sync.
        let query = "";
        if (last_sync !== '') {
          query += ` and modifiedTime > '${last_sync}'`;
        }

        let nextPageToken = "";
        do {
          const {data} = await gmail.users.messages.list({
            userId: 'me',
            pageToken: nextPageToken,
            q: query, 
          })

          for (const message of data.messages) {
            const {data} = await gmail.users.messages.get({
              userId: 'me',
              id: message.id,
              format: 'full'
            });
            const emailData = data;

            const headers = emailData.payload.headers;
            const subjectHeader = headers.find(header => header.name === 'Subject');

            if (emailData.payload && emailData.payload.parts && emailData.payload.parts.length > 0) {
              const emailBody = emailData.payload.parts[0].body.data;
              if (emailBody) {
                const emailContent = Buffer.from(emailBody, 'base64').toString('utf8');
                const doc: IndexableDocument = {
                  id: emailData.id,
                  organisationId: org.id,
                  title: subjectHeader.value,
                  source: AppNameDefinitions.GMAIL,
                  sections: [{
                    link : `https://mail.google.com/mail/u/0/#inbox/${message.id}`,
                    offset: emailContent.length,
                    content: emailContent
                  }],
                  type: DocType.TEXT,
                  updatedAt: new Date(parseInt(emailData.internalDate)),
                  metadata: {}
                };
                 documents.push(doc);
                 if (documents.length >= 100) {
                   yield documents;
                   documents = [];
                 }
              }
            } 
          }
          
          nextPageToken = data.nextPageToken;
        } while(nextPageToken);
        yield documents;
        // Update the last sync date  for the connector
        await this.oauthService_.update(oauth.id, {last_sync: new Date()});
      } catch (error) {

        if (error.response && error.response.status === 401) { // Check if it's an unauthorized error
          this.logger_.info(`Refreshing Asana token for ${org.id} organisation`);

          // Refresh the token
          const oauthToken = await this.container_["google-driveOauth"].refreshToken(oauth.refresh_token);
    
          // Update the OAuth record with the new token
          await this.oauthService_.update(oauth.id, oauthToken);
    
          // Retry the request
          return this.getGmailFiles(org);
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