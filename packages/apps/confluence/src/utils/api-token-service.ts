import { Organisation, RateLimiterService } from "@ocular/ocular";
import {
  IndexableDocument,
  Logger,
  AppNameDefinitions,
  DocType,
  Section,
} from "@ocular/types";
import axios from "axios";
import { RateLimiterQueue } from "rate-limiter-flexible";

interface ConfluencePage {
  id: string;
  title: string;
  url: string;
  body: any;
  status: string;
  createdBy: {
    display_name: string;
    email: string;
    avatar_url: string;
  };
  lastUpdated: string;
}

interface ConfluenceComment {
  id: string;
  title: string;
  url: string;
  body: any;
  status: string;
}

class ApiTokenService {
  private confluence_token_: string;
  private confluence_domain_name_: string;
  private confluence_user_name_: string;
  private headers_: any;
  private logger_: Logger;
  private org_: Organisation;
  private rateLimiterService_: RateLimiterService;
  private requestQueue_: RateLimiterQueue;
  private last_sync_: Date;

  constructor(
    token: string,
    domain_name: string,
    user_name: string,
    org: Organisation,
    logger: Logger,
    ratelimiterService: RateLimiterService,
    last_sync: Date
  ) {
    this.confluence_token_ = token;
    this.confluence_domain_name_ = domain_name;
    this.confluence_user_name_ = user_name;
    this.org_ = org;
    this.logger_ = logger;
    this.rateLimiterService_ = ratelimiterService;
    this.last_sync_ = last_sync;
    this.headers_ = {
      Authorization: `Basic ${Buffer.from(
        `${this.confluence_user_name_}:${this.confluence_token_}`
      ).toString("base64")}`,
      Accept: "application/json",
    };
    this.requestQueue_ = this.rateLimiterService_.getRequestQueue(
      AppNameDefinitions.CONFLUENCE
    );
  }

  /**
   * Fetches Confluence pages and converts them into indexable documents.
   *
   * @returns {Promise<IndexableDocument[]>} A promise that resolves to an array of indexable documents.
   */
  async confluenceIndexableDocuments(): Promise<IndexableDocument[]> {
    const indexableDocs: IndexableDocument[] = [];

    try {
      const confluencePages: ConfluencePage[] =
        await this.fetchConfluencePages();

      for (const page of confluencePages) {
        try {
          const pageComments = await this.fetchConfluencePageComments(page.id);
          const sections: Section[] = pageComments.map((comment) => {
            return {
              link: `https://${this.confluence_domain_name_}/wiki${comment.url}`,
              content: this.extractDataFromBlocks(comment.body),
              metadata: {
                status: comment.status,
                title: comment.title,
                id: comment.id,
              },
            };
          });

          sections.push({
            link: `https://${this.confluence_domain_name_}/wiki${page.url}`,
            content: this.extractDataFromBlocks(page.body),
            metadata: {
              status: page.status,
              title: page.title,
              id: page.id,
            },
          });

          const pageIndexableDocument: IndexableDocument = {
            id: page.id,
            organisationId: this.org_.id,
            title: page.title,
            type: DocType.TXT,
            sections,
            source: AppNameDefinitions.CONFLUENCE,
            metadata: {
              url: `https://${this.confluence_domain_name_}/wiki${page.url}`,
              status: page.status,
              createdBy: page.createdBy,
            },
            updatedAt: new Date(page.lastUpdated),
          };

          indexableDocs.push(pageIndexableDocument);
        } catch (error) {
          this.logger_.error(
            `fetchConfleuncePageComments: Failed to fetch comments for page ${page.id}`
          );
        }
      }
      return indexableDocs;
    } catch (error) {
      this.logger_.error(
        "confluenceIndexableDocuments: Error fetching Confluence pages"
      );
      throw new Error("Error fetching Confluence pages");
    }
  }

  /**
   * Fetches all Confluence pages and their comments.
   *
   * @returns {Promise<ConfluencePage[]>} A promise that resolves to an array of Confluence pages.
   */
  async fetchConfluencePages() {
    const pagesDocs = [];
    let cursor = null;
    const headers = this.headers_;

    try {
      while (true) {
        const params: any = {
          cursor: cursor,
          cql: this.last_sync_
            ? `type=page AND lastmodified >= ${this.formatDateToCustomString(
                this.last_sync_
              )} ORDER BY lastmodified DESC`
            : `type=page ORDER BY lastmodified DESC`,
        };

        const expandParams = [
          "history.lastUpdated",
          "history.createdBy",
          "body.atlas_doc_format",
        ].join(",");

        await this.requestQueue_.removeTokens(1, AppNameDefinitions.CONFLUENCE);
        const { data } = await axios.get(
          `https://${this.confluence_domain_name_}/wiki/rest/api/content/search?expand=${expandParams}`,
          { headers, params }
        );
        const results = data.results;

        const confluencePages = await Promise.all(
          results.map(async (page) => ({
            id: page.id,
            title: page.title,
            url: page._links.webui,
            body: this.extractDataFromAtlasDocFormat(
              page.body.atlas_doc_format.value
            ),
            status: page.status,
            lastUpdated: page.history.lastUpdated.when,
            createdBy: {
              display_name: page.history.createdBy.displayName,
              email: page.history.createdBy.email,
              avatar_url: page.history.createdBy.profilePicture["path"],
            },
          }))
        );

        pagesDocs.push(...confluencePages);
        cursor = data._links.next;
        if (!cursor) {
          break;
        }
      }
      return pagesDocs;
    } catch (err) {
      this.logger_.error(
        "fetchConfluencePages: Failed to fetch Confluence pages"
      );
      throw err;
    }
  }

  /**
   * Fetch comments for a Confluence page by page ID.
   *
   * @param {string} id - The ID of the Confluence page.
   * @returns {Promise<ConfluenceComment[]>} - A promise that resolves to an array of Confluence comments.
   */
  async fetchConfluencePageComments(id: string): Promise<ConfluenceComment[]> {
    const CommentsDocs = [];

    try {
      let cursor = null;
      const headers = this.headers_;

      while (true) {
        const params = {
          "body-format": "atlas_doc_format",
          cursor: cursor,
        };
        await this.requestQueue_.removeTokens(1, AppNameDefinitions.CONFLUENCE);
        const { data } = await axios.get(
          `https://${this.confluence_domain_name_}/wiki/api/v2/pages/${id}/footer-comments`,
          { headers, params }
        );

        const results = data.results;

        const confluenceComments = results.map((comment) => ({
          id: comment.id,
          title: comment.title,
          url: comment._links.webui,
          body: this.extractDataFromAtlasDocFormat(
            comment.body.atlas_doc_format.value
          ),
          status: comment.status,
        }));
        CommentsDocs.push(...confluenceComments);

        cursor = data._links.next;
        if (!cursor) break;
      }

      return CommentsDocs;
    } catch (err) {
      this.logger_.error(
        `fetchConfluencePageComments: Failed to fetch comments for page ${id}`
      );
      throw err;
    }
  }

  /**
   * Extracts data from the Atlas Doc Format content.
   *
   * This function parses the provided content string as JSON and retrieves the `content` property from it.
   * It's designed to work with the specific structure of Atlas Doc Format, where the relevant data is stored under a `content` key.
   *
   * @param {string} content - The string representation of the Atlas Doc Format content.
   * @returns {any} The extracted data from the `content` property of the parsed object.
   */
  extractDataFromAtlasDocFormat(content: any): any {
    try {
      const parsedContent = JSON.parse(content);
      return parsedContent.content;
    } catch (error) {
      throw new Error("Error parsing Atlas Doc Format content");
    }
  }

  /**
   * Extracts text data from an array of blocks.
   *
   * @param {Object[]} blocks - The array of blocks to process.
   * @param {string} blocks[].type - The type of the block.
   * @param {Object[]} [blocks[].content] - The content of the block.
   * @param {string} blocks[].content[].type - The type of the content.
   * @param {string} blocks[].content[].text - The text content.
   * @returns {string} The accumulated text data from the blocks.
   */
  extractDataFromBlocks(blocks: any[]): string {
    let data = "";
    const types = new Set(["paragraph", "heading", "doc"]);

    for (const block of blocks) {
      if (block && typeof block === "object" && types.has(block.type)) {
        let blockText = "";

        if (block.content && Array.isArray(block.content)) {
          for (const content of block.content) {
            if (
              content &&
              content.type === "text" &&
              typeof content.text === "string"
            ) {
              blockText += content.text;
            }
          }
        }

        data += blockText + "\n";
      }
    }
    return data.trim();
  }

  /**
   * Converts a Date object to a string in the format yyyy/MM/dd HH:mm.
   * @param {Date} date - The Date object to be converted.
   * @returns {string} The formatted date string.
   */
  formatDateToCustomString(date) {
    if (!(date instanceof Date)) {
      throw new TypeError("Invalid input: Expected a Date object");
    }

    const padZero = (num) => num.toString().padStart(2, "0");

    const year = date.getFullYear();
    const month = padZero(date.getMonth() + 1); // Months are 0-based in JavaScript
    const day = padZero(date.getDate());
    const hours = padZero(date.getHours());
    const minutes = padZero(date.getMinutes());

    return `${year}/${month}/${day} ${hours}:${minutes}`;
  }
}

export default ApiTokenService;
