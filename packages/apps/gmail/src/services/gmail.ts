import { Readable } from "stream";
import { EntityManager } from "typeorm";
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
import { OAuth2Client } from "google-auth-library";
import { ConfigModule } from "@ocular/ocular/src/types";
import fs from "fs";
import { google } from "googleapis";
import { RateLimiterQueue } from "rate-limiter-flexible";

export default class GmailService extends TransactionBaseService {
  protected appAuthorizationService_: AppAuthorizationService;
  protected rateLimiterService_: RateLimiterService;
  protected requestQueue_: RateLimiterQueue;
  protected logger_: Logger;
  protected container_: ConfigModule;

  constructor(container) {
    super(arguments[0]);
    this.appAuthorizationService_ = container.appAuthorizationService;
    this.logger_ = container.logger;
    this.container_ = container;
    this.rateLimiterService_ = container.rateLimiterService;
    this.requestQueue_ = this.rateLimiterService_.getRequestQueue(
      AppNameDefinitions.GMAIL
    );
  }

  async getGmailData(org: Organisation) {
    return Readable.from(this.getGmailFiles(org));
  }

  async *getGmailFiles(org: Organisation): AsyncGenerator<IndexableDocument[]> {
    // Check if the auth record exists for this App in this Organisation.
    const auth = await this.appAuthorizationService_.retrieve({
      id: org.id,
      app_name: AppNameDefinitions.GMAIL,
    });

    if (!auth) {
      this.logger_.error(
        `No Gmail OAuth Cred found for ${org.id} organisation`
      );
      return;
    }

    try {
      // Get the last sync date - this is the time the latest document that was synced from Gmail.
      let last_sync = "";
      if (auth.last_sync !== null) {
        last_sync = auth.last_sync.toISOString();
      }

      // Get the auth2Client for the Gmail App and set the credentials.
      const oauth2Client: OAuth2Client = await this.container_[
        `${AppNameDefinitions.GMAIL}Oauth`
      ].getOauthCLient();

      oauth2Client.setCredentials({
        access_token: auth.token,
        refresh_token: auth.refresh_token,
      });
      const gmail = google.gmail({ version: "v1", auth: oauth2Client });

      let documents: IndexableDocument[] = [];

      // Only Sync Files Modified After Last Sync.
      let query = "";
      if (last_sync !== "") {
        query += ` and modifiedTime > '${last_sync}'`;
      }

      let nextPageToken = "";
      do {
        // Block Until Rate Limit Allows Request
        await this.requestQueue_.removeTokens(1, AppNameDefinitions.GMAIL);
        const { data } = await gmail.users.messages.list({
          userId: "me",
          pageToken: nextPageToken,
          q: query,
        });

        for (const message of data.messages) {
          // Block Until Rate Limit Allows Request
          await this.requestQueue_.removeTokens(1, AppNameDefinitions.GMAIL);
          const { data } = await gmail.users.messages.get({
            userId: "me",
            id: message.id,
            format: "full",
          });
          const emailData = data;

          const headers = emailData.payload.headers;
          const subjectHeader = headers.find(
            (header) => header.name === "Subject"
          );

          if (
            emailData.payload &&
            emailData.payload.parts &&
            emailData.payload.parts.length > 0
          ) {
            const emailBody = emailData.payload.parts[0].body.data;
            if (emailBody) {
              const emailContent = Buffer.from(emailBody, "base64").toString(
                "utf8"
              );
              const doc: IndexableDocument = {
                id: emailData.id,
                organisationId: org.id,
                title: subjectHeader.value,
                source: AppNameDefinitions.GMAIL,
                sections: [
                  {
                    link: `https://mail.google.com/mail/u/0/#inbox/${message.id}`,
                    content: emailContent,
                  },
                ],
                type: DocType.TXT,
                updatedAt: new Date(parseInt(emailData.internalDate)),
                metadata: {},
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
      } while (nextPageToken);
      yield documents;
      // Update the last sync date  for the connector
      await this.appAuthorizationService_.update(auth.id, {
        last_sync: new Date(),
      });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // Check if it's an unauthorized error
        this.logger_.info(
          `getGmailFiles: Refreshing Gmail token for ${org.id} organisation`
        );

        // Refresh the token
        const authToken = await this.container_[
          "gmail-driveOauth"
        ].refreshToken(auth.refresh_token);

        // Update the Auth record with the new token
        await this.appAuthorizationService_.update(auth.id, authToken);

        // Retry the request
        return this.getGmailFiles(org);
      }

      this.logger_.error(
        "getGmailFiles: The API returned an error: " + error.message
      );
      return null;
    }
  }
}
