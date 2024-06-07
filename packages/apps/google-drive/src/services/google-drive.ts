import { Readable } from "stream";
import { EntityManager } from "typeorm";
import {
  App,
  OAuthService,
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
import { google, drive_v3 } from "googleapis";
import { RateLimiterQueue } from "rate-limiter-flexible";
import { AutoflowAiError, AutoflowAiErrorTypes } from "@ocular/utils";

export default class GoogleDriveService extends TransactionBaseService {
  protected oauthService_: OAuthService;
  protected rateLimiterService_: RateLimiterService;
  protected logger_: Logger;
  protected container_: ConfigModule;
  protected requestQueue_: RateLimiterQueue;

  constructor(container) {
    super(arguments[0]);
    this.oauthService_ = container.oauthService;
    this.rateLimiterService_ = container.rateLimiterService;
    this.logger_ = container.logger;
    this.container_ = container;
    this.requestQueue_ = this.rateLimiterService_.getRequestQueue(
      AppNameDefinitions.GOOGLEDRIVE
    );
  }

  async getGoogleDriveData(org: Organisation) {
    return Readable.from(this.getGoogleDriveFiles(org));
  }

  async *getGoogleDriveFiles(
    org: Organisation
  ): AsyncGenerator<IndexableDocument[]> {
    // Check if the OAuth record exists for this App in this Organisation.
    const oauth = await this.oauthService_.retrieve({
      id: org.id,
      app_name: AppNameDefinitions.GOOGLEDRIVE,
    });

    if (!oauth) {
      this.logger_.error(
        `getGoogleDriveFiles: No Google Drive OAuth Credential found for ${org.id} organisation`
      );
      return null;
    }

    try {
      // Get the last sync date - this is the time the latest document that was synced from Google Drive.
      let last_sync = "";
      if (oauth.last_sync !== null) {
        last_sync = oauth.last_sync.toISOString();
      }

      // Get the OAuth2Client for the Google Drive App and set the credentials.
      const oauth2Client: OAuth2Client = await this.container_[
        `${AppNameDefinitions.GOOGLEDRIVE}Oauth`
      ].getOauthCLient();

      oauth2Client.setCredentials({
        access_token: oauth.token,
        refresh_token: oauth.refresh_token,
      });

      const drive: drive_v3.Drive = await google.drive({
        version: "v3",
        auth: oauth2Client,
      });

      // Array storing the processed documents
      let documents: IndexableDocument[] = [];
      // Only Sync Files Modified After Last Sync.
      let query = "mimeType='application/vnd.google-apps.document'";
      if (last_sync !== "") {
        query += ` and modifiedTime > '${last_sync}'`;
      }

      // Paginate To Get All Files From Google Drive
      let pageToken = null;
      do {
        // Block Until Rate Limit Allows Request
        await this.requestQueue_.removeTokens(
          1,
          AppNameDefinitions.GOOGLEDRIVE
        );
        const { data } = await drive.files.list({
          q: query,
          fields: "files(id,name,modifiedTime,webViewLink)",
          pageToken: pageToken,
        });
        // Get the content of each file
        for (const file of data.files) {
          // Get Each Files Content As Plain Text
          const content = await this.getGoogleDriveFileContent(file.id, drive);
          if (!content) {
            continue;
          }
          const doc: IndexableDocument = {
            id: file.id,
            organisationId: org.id,
            title: file.name,
            source: AppNameDefinitions.GOOGLEDRIVE,
            sections: [
              {
                link: file.webViewLink,
                content: content,
              },
            ],
            type: DocType.TXT,
            metadata: {},
            updatedAt: new Date(file.modifiedTime),
          };
          // Batch Documents To Be Yielded To Max 100 At A Time
          if (documents.length == 100) {
            this.logger_.info("getGoogleDriveFiles: Yielding 100 documents");
            yield documents;
            documents = [];
          }
          documents.push(doc);
        }
        pageToken = data.nextPageToken;
      } while (pageToken);
      // Yield The Remaining Documents
      yield documents;
      // Update the last sync date  for the connector
      await this.oauthService_.update(oauth.id, { last_sync: new Date() });
    } catch (error) {
      // If the error is an unauthorized error, refresh the token and retry the request
      if (error.response && error.response.status === 401) {
        // Check if it's an unauthorized error
        this.logger_.info(
          `getGoogleDriveFiles: Refreshing Google Drive token for ${org.id} organisation`
        );

        // Refresh the token
        const oauthToken = await this.container_[
          "google-driveOauth"
        ].refreshToken(oauth.refresh_token);

        // Update the OAuth record with the new token
        await this.oauthService_.update(oauth.id, oauthToken);

        // Retry the request
        return this.getGoogleDriveFiles(org);
      }
      this.logger_.error(
        "getGoogleDriveFiles: The API returned an error: " + error.message
      );
      return null;
    }
  }

  // Get The Content Of A Google Drive File
  async getGoogleDriveFileContent(fileId: string, drive: drive_v3.Drive) {
    try {
      await this.requestQueue_.removeTokens(1, AppNameDefinitions.GOOGLEDRIVE);
      return await new Promise<string>((resolve, reject) => {
        let data = "";
        drive.files
          .export(
            {
              fileId: fileId,
              mimeType: "text/plain",
            },
            { responseType: "stream" }
          )
          .then((response) => {
            response.data
              .on("data", (chunk) => (data += chunk))
              .on("end", () => resolve(data))
              .on("error", reject);
          })
          .catch(reject);
      });
    } catch (error) {
      this.logger_.error(
        `getGoogleDriveFileContent: Error fetching content for file ${fileId} with error: ${error.message}`
      );
      return null;
    }
  }
}
