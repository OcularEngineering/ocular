import { Readable } from 'stream';
import { EntityManager } from "typeorm";
import { Octokit } from "@octokit/rest";
import { OAuthService, Organisation } from "@ocular/ocular";
import { IndexableDocument, TransactionBaseService, Logger, AppNameDefinitions  } from "@ocular-ai/types";
import {OAuth2Client} from 'google-auth-library';
import { ConfigModule } from '@ocular/ocular/src/types';
import { App } from "octokit";
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
      const oauth = await this.oauthService_.retrieve({id: org.id, app_name: AppNameDefinitions.GMAIL});
      let documents: IndexableDocument[] = [];

      if (!oauth) {
        this.logger_.error(`No Gmail OAuth Cred found for ${org.id} organisation`);
        return;
      }
      let last_sync = ''
      if(oauth.last_sync!==null){
        last_sync =  oauth.last_sync.toISOString();
      }

      const oauth2Client:OAuth2Client = await this.container_[`${AppNameDefinitions.GMAIL}Oauth`].getOauthCLient();
      oauth2Client.setCredentials({ access_token: oauth.token, refresh_token: oauth.refresh_token});

      const gmail = google.gmail({version: 'v1', auth: oauth2Client});
  
      // Currently Gets Docs Only But Needs To Be Extended To Get All Files Like Videos, Slides Etc
      try {

        const {data} = await gmail.users.messages.list({
          userId: 'me',
          labelIds: ['INBOX'],
        })

        console.log("Gmail Data")
        console.log(data)

        // for (const message of data.messages) {
        //   const {data} = await gmail.users.messages.get({
        //     userId: 'me',
        //     id: message.id,
        //   });
        //   const emailData = data;
        //   const headers = emailData.payload.headers;
        //   const subjectHeader = headers.find(header => header.name === 'Subject');

        //   if (emailData.payload && emailData.payload.parts && emailData.payload.parts.length > 0) {
        //     const emailBody = emailData.payload.parts[0].body.data;
        //     if (emailBody) {
        //       const emailContent = Buffer.from(emailBody, 'base64').toString('utf8');
        //       const doc: IndexableDocument = {
        //         id: emailData.id,
        //         organisation_id: org.id,
        //         title: subjectHeader.value,
        //         source: AppNameDefinitions.GMAIL,
        //         content:  emailContent,
        //         updated_at: new Date(parseInt(emailData.internalDate)),
        //         location: `https://mail.google.com/mail/u/0/#inbox/${message.id}`,
        //       };
        //        documents.push(doc);
        //     }
        //   } 

        //   if(documents.length == 50){
        //     yield documents;
        //     documents = [];
        //   }

        // await this.oauthService_.update(oauth.id, {last_sync: new Date()});
        // yield documents;
        // }
        // await this.oauthService_.update(oauth.id, {last_sync: new Date()});
      
        
    
        //   const messages = data.messages;
        //   if (messages) {
        //     messages.forEach((message) => {
        //       // documents.push(doc);
        //       gmail.users.messages.get({
        //         userId: 'me',
        //         id: message.id,
        //       }, (err, res) => {
        //         if (err) return console.log('The API returned an error: ' + err);
        //         const emailData = res.data;
             
                
        //         const headers = emailData.payload.headers;
        //         const subjectHeader = headers.find(header => header.name === 'Subject');

        //         if (emailData.payload && emailData.payload.parts && emailData.payload.parts.length > 0) {
        //           const emailBody = emailData.payload.parts[0].body.data;
        //           if (emailBody) {
        //             const emailContent = Buffer.from(emailBody, 'base64').toString('utf8');
        //             console.log(`Email ID: ${emailData.id}`);
        //             console.log(`Email Subject: ${subjectHeader.value}`);
        //             console.log(`Email Content: ${emailContent}`);



        //           const doc: IndexableDocument = {
        //           id: emailData.id,
        //           organisation_id: org.id,
        //           title: subjectHeader.value,
        //           source: AppNameDefinitions.GMAIL,
        //           content:  emailContent,
        //           updated_at: new Date(parseInt(emailData.internalDate)),
        //           location: `https://mail.google.com/mail/u/0/#inbox/${message.id}`,
        //         };
        //          documents.push(doc);

              

        //         } else {
        //           console.log('No email body found.');
        //         }
              
        //         } else {
        //           console.log('No email body found.');
        //         }
        //     });


       

        //     });
          
        //   } else {
        //     console.log('No messages found.');
        //   }
        // });
        // await this.oauthService_.update(oauth.id, {last_sync: new Date()});
        // yield documents;
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