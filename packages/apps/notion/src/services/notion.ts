import fs from "fs";
import axios from "axios";
import { Readable } from "stream";
import { OAuthService, Organisation } from "@ocular/ocular";
import {
  IndexableDocument,
  TransactionBaseService,
  Logger,
  AppNameDefinitions,
  DocType,
} from "@ocular/types";
import { ConfigModule } from "@ocular/ocular/src/types";
import { RateLimit } from "async-sema";

export default class NotionService extends TransactionBaseService {
  protected oauthService_: OAuthService;
  protected logger_: Logger;
  protected container_: ConfigModule;

  constructor(container) {
    super(arguments[0]);
    this.oauthService_ = container.oauthService;
    this.logger_ = container.logger;
    this.container_ = container;
  }

  async getNotionPagesData(org: Organisation) {
    return Readable.from(this.getNotionPagesAndBlocks(org));
  }

  async *getNotionPagesAndBlocks(
    org: Organisation
  ): AsyncGenerator<IndexableDocument[]> {
    this.logger_.info(
      `Starting oculation of Notion for ${org.id} organisation`
    );

    // Get Notion OAuth for the organisation
    const oauth = await this.oauthService_.retrieve({
      id: org.id,
      app_name: AppNameDefinitions.NOTION,
    });

    if (!oauth) {
      this.logger_.error(`No Notion OAuth found for ${org.id} organisation`);
      return;
    }

    let documents: IndexableDocument[] = [];

    const rateLimiter = RateLimit(1, {
      timeUnit: 2000,
      uniformDistribution: true,
    });

    try {
      const notionPages = await this.getNotionPages(oauth.token, rateLimiter);
      for (const page of notionPages) {
        const text = await this.processBlock(oauth.token, page.id, rateLimiter);
        const title = this.generateTitleFromParagraph(text);
        // Add Project To Documents
        const pageDoc: IndexableDocument = {
          id: page.id,
          organisationId: org.id,
          title: title,
          source: AppNameDefinitions.NOTION,
          sections: [
            {
              content: text,
              link: page.url,
              offset: text.length,
            },
          ],
          type: DocType.TEXT,
          updatedAt: new Date(page.last_edited_time),
          metadata: {},
        };
        documents.push(pageDoc);

        if (documents.length >= 100) {
          yield documents;
          documents = [];
        }
      }

      yield documents;

      await this.oauthService_.update(oauth.id, { last_sync: new Date() });
    } catch (error) {
      console.error(error);
    }

    this.logger_.info(
      `Finished oculation of Notion for ${org.id} organisation`
    );
  }

  // Get Notion Pages ID
  getPagesInfo(data) {
    // Iterate through array to get ID of all pages
    return data.map((element) => {
      const elementInfo = {
        id: element.id,
        url: element.url,
        last_edited_time: element.last_edited_time,
      };
      return elementInfo;
    });
  }

  async getNotionPages(accessToken: string, limit) {
    const resultPages = [];

    const requestData = {
      filter: {
        value: "page",
        property: "object",
      },
      sort: {
        direction: "ascending",
        timestamp: "last_edited_time",
      },
    };
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
    };

    try {
      // First request to fetch initial pages
      let response = await axios.post(
        `https://api.notion.com/v1/search`,
        requestData,
        { headers }
      );

      // Extract page IDs from the initial response
      resultPages.push(...this.getPagesInfo(response.data.results));

      let hasMore = response.data.has_more;
      let nextCursor = response.data.next_cursor;

      // Loop until there are no more pages to fetch
      while (hasMore) {
        await limit(); // Rate limiting to respect Notion's API limits

        // Subsequent requests with pagination
        response = await axios.post(
          `https://api.notion.com/v1/search`,
          {
            ...requestData,
            start_cursor: nextCursor,
          },
          { headers }
        );

        // Extract page IDs from the response and concatenate with existing ones
        resultPages.push(...this.getPagesInfo(response.data.results));

        // Update loop control variables
        hasMore = response.data.has_more;
        nextCursor = response.data.next_cursor;
      }

      return resultPages;
    } catch (error) {
      console.error("Error fetching Notion pages:", error);
      throw error;
    }
  }

  getPlainTextFromRichText = (richText) => {
    return richText.map((element) => element.plain_text).join("");
  };

  async retrieveBlockChildren(accessToken: string, blockID: string, limit) {
    console.log("Retrieving blocks (async)...");
    const blocks = [];

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Notion-Version": "2022-06-28",
    };

    try {
      // First request to fetch initial pages
      let response = await axios.get(
        `https://api.notion.com/v1/blocks/${blockID}/children`,
        { headers }
      );

      // Extract page IDs from the initial response
      blocks.push(...response.data.results);

      let hasMore = response.data.has_more;
      let nextCursor = response.data.next_cursor;

      // Loop until there are no more pages to fetch
      while (hasMore) {
        await limit(); // Rate limiting to respect Notion's API limits

        const queryParams = {
          start_cursor: nextCursor,
        };

        // Subsequent requests with pagination
        response = await axios.get(
          `https://api.notion.com/v1/blocks/${blockID}/children`,
          { params: queryParams, headers }
        );

        // Extract page IDs from the response and concatenate with existing ones
        blocks.push(...response.data.results);

        // Update loop control variables
        hasMore = response.data.has_more;
        nextCursor = response.data.next_cursor;
      }

      return blocks;
    } catch (error) {
      console.error("Error fetching Children Blocks", error);
      throw error;
    }
  }

  async processBlock(accessToken: string, blockID: string, limit) {
    console.log("Handling Block with ID :", blockID);
    const childrenBlocks = await this.retrieveBlockChildren(
      accessToken,
      blockID,
      limit
    );

    let text = "";
    for (const block of childrenBlocks) {
      if (block.type === "paragraph") {
        if (block[block.type].rich_text) {
          text += this.getPlainTextFromRichText(block[block.type].rich_text);
        }

        if (block.has_children) {
          text += await this.processBlock(accessToken, block.id, limit);
        }
      }
    }

    return text;
  }

  generateTitleFromParagraph(paragraph: string) {
    // Find the index of the first line break or full stop
    const lineBreakIndex = paragraph.indexOf("\n");
    const fullStopIndex = paragraph.indexOf(".");

    // Determine the position of the title end (whichever comes first)
    let titleEndIndex;
    if (lineBreakIndex !== -1 && fullStopIndex !== -1) {
      titleEndIndex = Math.min(lineBreakIndex, fullStopIndex);
    } else if (lineBreakIndex !== -1) {
      titleEndIndex = lineBreakIndex;
    } else if (fullStopIndex !== -1) {
      titleEndIndex = fullStopIndex;
    } else {
      // If no line break or full stop is found, use the entire paragraph as title
      return paragraph.trim(); // Trim leading and trailing whitespace
    }

    // Extract the title from the beginning of the paragraph up to titleEndIndex
    let title = paragraph.substring(0, titleEndIndex).trim();

    if (title.length === 0) {
      // Provide a default title or appropriate fallback
      title = "Notion Page"; // Example default title
    }
    return title;
  }
}
