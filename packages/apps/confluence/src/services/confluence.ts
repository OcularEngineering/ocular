import fs from "fs";
import axios from "axios";
import { Readable } from "stream";
import { OAuthService, Organisation,RateLimiterService } from "@ocular/ocular";
import {
  IndexableDocument,
  TransactionBaseService,
  Logger,
  AppNameDefinitions,
  DocType,
} from "@ocular/types";
import { ConfigModule } from "@ocular/ocular/src/types";
import { RateLimiterQueue } from "rate-limiter-flexible"

interface Config {
  headers: {
    Authorization: string;
    Accept: string;
  };
}

export default class ConfluenceService extends TransactionBaseService {
  protected oauthService_: OAuthService;
  protected logger_: Logger;
  protected container_: ConfigModule;
  protected rateLimiterService_: RateLimiterService;
  protected requestQueue_: RateLimiterQueue

  constructor(container) {
    super(arguments[0]);
    this.oauthService_ = container.oauthService;
    this.logger_ = container.logger;
    this.container_ = container;
    this.rateLimiterService_ = container.rateLimiterService;
    this.requestQueue_ = this.rateLimiterService_.getRequestQueue(AppNameDefinitions.CONFLUENCE);
  }

  async getConfluenceData(org: Organisation) {
    return Readable.from(this.getConfluenceSpaceAndPages(org));
  }

  async *getConfluenceSpaceAndPages(
    org: Organisation
  ): AsyncGenerator<IndexableDocument[]> {
    this.logger_.info(
      `Starting oculation of Confluence for ${org.id} organisation`
    );

    // Get Confluence OAuth for the organisation
    const oauth = await this.oauthService_.retrieve({
      id: org.id,
      app_name: AppNameDefinitions.CONFLUENCE,
    });

    if (!oauth) {
      this.logger_.error(
        `No Confluence OAuth found for ${org.id} organisation`
      );
      return;
    }

    const config: Config = {
      headers: {
        Authorization: `Bearer ${oauth.token}`,
        Accept: "application/json",
      },
    };

    try {
      const cloudID = await this.fetchConfluenceCloudID(config);

      if (!cloudID) {
        this.logger_.error("Failed to retrieve Confluence Cloud ID");
        return;
      }

      const pages = await this.fetchConfluencePages(cloudID, config);

      if (!pages) {
        this.logger_.error("No accesible pages found in conflunece instance.");
      }

      let documents: IndexableDocument[] = [];
      for (const pageID of pages) {
        const pageInfo = await this.fetchPageContent(pageID, cloudID, config);
        if (pageInfo.text) {
          const pageDocument: IndexableDocument = {
            id: pageInfo.id,
            organisationId: org.id,
            title: pageInfo.title,
            source: AppNameDefinitions.CONFLUENCE,
            sections: [
              {
                content: pageInfo.text,
                link: pageInfo.location,
              },
            ],
            type: DocType.TEXT,
            updatedAt: new Date(),
            metadata: {},
          };

          documents.push(pageDocument);
        }

        if (documents.length >= 100) {
          yield documents;
          documents = [];
        }
      }

      yield documents;
      await this.oauthService_.update(oauth.id, { last_sync: new Date() });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        this.logger_.info(
          `Refreshing Confluence token for ${org.id} organisation`
        );

        const oauthToken = await this.container_[
          "confluenceOauth"
        ].refreshToken(oauth.refresh_token);

        await this.oauthService_.update(oauth.id, oauthToken);

        return this.getConfluenceSpaceAndPages(org);
      } else {
        console.error("Error fetching Confluence page content:", error);
      }
    }

    this.logger_.info(
      `Finished oculation of Confluence for ${org.id} organisation`
    );
  }

  async fetchPageContent(pageID: string, cloudID: string, config: Config) {
    try {
      // Block Until Rate Limit Allows Request
      await this.requestQueue_.removeTokens(1,AppNameDefinitions.CONFLUENCE)
      const baseUrl = `https://api.atlassian.com/ex/confluence/${cloudID}/wiki/api/v2/pages`;
      const pageContentUrl = `${baseUrl}/${pageID}?body-format=atlas_doc_format`;

      const response = await axios.get(pageContentUrl, config);

      const { title, _links, body } = response.data;
      const pageLinkBase = _links.base;
      const pageLinkWebUI = _links.webui;
      const pageLink = `${pageLinkBase}${pageLinkWebUI}`;

      const pageInformation = body.atlas_doc_format.value;
      const contentArray = JSON.parse(pageInformation).content;

      let pageText = "";

      for (const element of contentArray) {
        if (element.type === "paragraph" && element.content) {
          const textArray = element.content.filter(
            (textElement) => textElement.type === "text" && textElement.text
          );
          const paratext = textArray
            .map((textElement) => textElement.text)
            .join(" ");
          pageText += paratext + " ";
        }
      }

      return {
        id: pageID,
        title: title,
        location: pageLink,
        text: pageText.trim(),
      };
    } catch (error) {
      console.error("Error in Fetching Page Content:", error.message);
      throw error;
    }
  }

  async fetchConfluenceCloudID(config: Config) {
    try {
      const accessibleResourcesResponse = await axios.get(
        "https://api.atlassian.com/oauth/token/accessible-resources",
        config
      );

      const accessibleResources = accessibleResourcesResponse.data;

      if (!accessibleResources || accessibleResources.length === 0) {
        throw new Error("No accessible resources found.");
      }

      const cloudId = accessibleResources[0].id;

      if (!cloudId) {
        throw new Error("Invalid cloud ID.");
      }

      return cloudId;
    } catch (error) {
      this.logger_.error(`Error in fetching Cloud ID of Confluence Instance.`);
      throw error;
    }
  }

  async fetchConfluencePages(cloudID: string, config: Config) {
    try {
      // Block Until Rate Limit Allows Request
      await this.requestQueue_.removeTokens(1,AppNameDefinitions.CONFLUENCE)
      const pagesEndpoint = `https://api.atlassian.com/ex/confluence/${cloudID}/wiki/rest/api/content`;

      const pagesResponse = await axios.get(pagesEndpoint, config);

      const pagesResults = pagesResponse.data.results;
      const pages = pagesResults.map((page) => page.id);

      return pages;
    } catch (error) {
      this.logger_.error(`Failed to retrieve Confluence pages:`, error.message);
      throw error;
    }
  }
}
