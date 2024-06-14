import fs from "fs";
import axios from "axios";
import { Readable } from "stream";
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
  Section,
} from "@ocular/types";
import { ConfigModule } from "@ocular/ocular/src/types";
import { RateLimit } from "async-sema";
import { RateLimiterQueue } from "rate-limiter-flexible";

interface NotionBlock {
  id: string;
  text: string;
}

interface NotionPage {
  id: string;
  url: string;
  last_edited_time: string;
  created_time: string;
  properties: Record<string, any>;
}

export default class NotionService extends TransactionBaseService {
  protected appAuthorizationService_: AppAuthorizationService;
  protected logger_: Logger;
  protected container_: ConfigModule;
  protected rateLimiterService_: RateLimiterService;
  protected requestQueue_: RateLimiterQueue;
  private indexedPages: Set<string> = new Set();
  private accessToken: string;

  constructor(container) {
    super(arguments[0]);
    this.appAuthorizationService_ = container.appAuthorizationService;
    this.logger_ = container.logger;
    this.container_ = container;
    this.rateLimiterService_ = container.rateLimiterService;
    this.requestQueue_ = this.rateLimiterService_.getRequestQueue(
      AppNameDefinitions.NOTION
    );
  }

  async notionIndexableDocuments(org: Organisation) {
    return Readable.from(this.fetchNotionData(org));
  }

  async *fetchNotionData(
    org: Organisation
  ): AsyncGenerator<IndexableDocument[]> {
    // Get Notion auth for the organisation
    const auth = await this.appAuthorizationService_.retrieve({
      id: org.id,
      app_name: AppNameDefinitions.NOTION,
    });

    if (!auth) {
      this.logger_.error(`No Notion auth found for ${org.id} organisation`);
      return null;
    }
    this.accessToken = auth.token;
    let documents: IndexableDocument[] = [];

    try {
      const notionPageIndexDocs = await this.queryNotionPages(org);

      for (const pageDoc of notionPageIndexDocs) {
        documents.push(pageDoc);
        if (documents.length >= 100) {
          yield documents;
          documents = [];
        }
      }
      yield documents;

      await this.appAuthorizationService_.update(auth.id, {
        last_sync: new Date(),
      });
    } catch (error) {
      this.logger_.error(
        `fetchNotionData : Error fetching Notion pages for ${org.id} organisation: ${error}`
      );
    }
  }

  /**
   * Queries Notion API for pages and transforms them into indexable documents.
   *
   * @param {Organisation} org - The organisation that owns the pages.
   * @returns {Promise<IndexableDocument[]>} - A promise that resolves to an array of indexable documents.
   */
  async queryNotionPages(org: Organisation): Promise<IndexableDocument[]> {
    const headers = {
      Authorization: `Bearer ${this.accessToken}`,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
    };

    const notionIndexPageDocs: IndexableDocument[] = [];

    try {
      while (true) {
        const data = {
          filter: {
            value: "page",
            property: "object",
          },
          sort: {
            direction: "descending",
            timestamp: "last_edited_time",
          },
        };

        await this.requestQueue_.removeTokens(1, AppNameDefinitions.NOTION);
        const response = await axios.post(
          `https://api.notion.com/v1/search`,
          data,
          { headers }
        );

        const notionPages: NotionPage[] = this.extractNotionPages(
          response.data.results
        );

        const notionPageDocs: IndexableDocument[] = await this.readPages(
          notionPages,
          org
        );

        notionIndexPageDocs.push(...notionPageDocs);

        if (response.data.has_more) {
          data["start_cursor"] = response.data["next_cursor"];
          continue;
        }
        break;
      }

      return notionIndexPageDocs;
    } catch (error) {
      this.logger_.error(
        `queryNotionPages: Error querying Notion pages for ${org.id} organisation: ${error}`
      );
      return [];
    }
  }

  /**
   * Extracts relevant Notion page properties from the data.
   *
   * @param data Array of objects containing raw Notion page data.
   * @returns Array of NotionPage objects with selected properties.
   */
  extractNotionPages(data: object[]): NotionPage[] {
    const keys: (keyof NotionPage)[] = [
      "id",
      "url",
      "last_edited_time",
      "created_time",
      "properties",
    ];

    return data.map((obj) => {
      const result: Partial<NotionPage> = {};

      for (const key of keys) {
        if (key in obj) {
          result[key] = obj[key as keyof typeof obj];
        }
      }

      return result as NotionPage;
    });
  }

  /**
   * Reads a list of Notion pages and transforms them into indexable documents.
   *
   * @param {NotionPage[]} pages - The list of Notion pages to read.
   * @param {Organisation} org - The organisation that owns the pages.
   * @returns {Promise<IndexableDocument[]>} - A promise that resolves to an array of indexable documents.
   */
  async readPages(
    pages: NotionPage[],
    org: Organisation
  ): Promise<IndexableDocument[]> {
    const notionPageDocs: IndexableDocument[] = [];
    for (const page of pages) {
      if (page.id in this.indexedPages) {
        continue;
      }

      const notionBlocks = await this.readBlocks(page.id);
      const pageTitle: string = this.generateTitle(page);

      const sections: Section[] = notionBlocks.map((block) => {
        return {
          content: block.text,
          link: `${page.url}#${block.id.replace(/-/g, "")}`,
        };
      });

      const pageDoc: IndexableDocument = {
        id: page.id,
        organisationId: org.id,
        title: pageTitle,
        source: AppNameDefinitions.NOTION,
        sections,
        type: DocType.TXT,
        updatedAt: new Date(page.last_edited_time),
        metadata: {},
      };

      notionPageDocs.push(pageDoc);
      this.indexedPages.add(page.id);
    }

    return notionPageDocs;
  }

  /**
   * Fetches a Notion page by its ID.
   *
   * @param {string} pageId - The ID of the Notion page to fetch.
   * @returns {Promise<NotionPage>} - A promise that resolves to the fetched Notion page.
   */
  async fetchPage(pageId: string): Promise<NotionPage> {
    const headers = {
      Authorization: `Bearer ${this.accessToken}`,
      "Notion-Version": "2022-06-28",
    };

    try {
      await this.requestQueue_.removeTokens(1, AppNameDefinitions.NOTION);
      const response = await axios.get(
        `https://api.notion.com/v1/pages/${pageId}`,
        { headers }
      );

      const notionPages: NotionPage[] = this.extractNotionPages([
        response.data,
      ]);

      return notionPages[0];
    } catch (error) {
      this.logger_.error(
        `fetchPage: Error fetching Notion page ${pageId}: ${error}`
      );
    }
  }

  /**
   * This asynchronous function fetches and processes blocks of data from the Notion API.
   *
   * @param {string} baseBlockID - The ID of the base block from which to start fetching data.
   *
   * @returns {Promise<NotionBlock[]>} A promise that resolves to an object containing two arrays:
   * - notionBlocks: An array of NotionBlock objects, each containing an ID and text content.
   *
   *
   * @async
   */
  async readBlocks(baseBlockID: string): Promise<NotionBlock[]> {
    const notionBlocks: NotionBlock[] = [];
    let cursor: string | null = null;

    while (true) {
      const config: any = {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Notion-Version": "2022-06-28",
        },
        params: {
          start_cursor: cursor,
        },
      };

      try {
        const { data } = await axios.get(
          `https://api.notion.com/v1/blocks/${baseBlockID}/children`,
          config
        );

        if (!data.results) {
          return notionBlocks;
        }

        data.results.forEach(async (block: any) => {
          const blockId: string = block.id;
          const blockType: string = block.type;
          const blockData: any = block[blockType];

          if (blockType === "unsupported" || blockType === "ai_block") return;

          let blockContent: string = "";
          if (blockData.rich_text) {
            for (const rich_text of blockData.rich_text) {
              if (rich_text.text && rich_text.text.content) {
                blockContent += rich_text.text.content;
              }
            }
          }

          if (blockData.has_children) {
            try {
              const childrenBlocksData = await this.readBlocks(blockId);
              notionBlocks.push(...childrenBlocksData);
            } catch (error) {
              console.error(
                `Failed to read blocks for child block ${blockId}`,
                error
              );
            }
          }

          if (blockContent) {
            notionBlocks.push({
              id: blockId,
              text: blockContent,
            } as NotionBlock);
          }
        });

        if (!data.has_more) {
          break;
        }

        cursor = data.next_cursor;
      } catch (error) {
        this.logger_.error(
          `readBlocks: Error reading blocks for ${baseBlockID}: ${error}`
        );
        return [];
      }
    }

    return notionBlocks;
  }

  /**
   * Generates a title for a Notion page based on its properties.
   *
   * @param {NotionPage} page - The Notion page object.
   * @returns {string} - The generated title or a default title if no title is found.
   */
  generateTitle(page: NotionPage): string {
    let pageTitle: string | null = null;

    for (const propKey in page.properties) {
      if (Object.prototype.hasOwnProperty.call(page.properties, propKey)) {
        const prop = page.properties[propKey];

        if (prop.type === "title" && prop.title && prop.title.length > 0) {
          pageTitle = prop.title
            .map((t) => t.plain_text)
            .join(" ")
            .trim();
          break;
        }
      }
    }

    if (!pageTitle) {
      pageTitle = `Untitled Page [${page.id}]`;
    }

    return pageTitle;
  }
}
