import fs from "fs";
import axios from "axios";
import { Readable } from "stream";
import {
  OAuthService,
  Organisation,
  OrganisationService,
} from "@ocular/ocular";
import {
  IndexableDocument,
  TransactionBaseService,
  Logger,
  AppNameDefinitions,
  DocType,
} from "@ocular/types";
import { ConfigModule } from "@ocular/ocular/src/types";
import puppeteer, { Browser, Page } from "puppeteer";

interface metadataLink {
  location: string;
  status: string;
}

export default class webConnectorService extends TransactionBaseService {
  protected oauthService_: OAuthService;
  protected logger_: Logger;
  protected container_: ConfigModule;
  protected organisationService_: OrganisationService;

  constructor(container) {
    super(arguments[0]);
    this.oauthService_ = container.oauthService;
    this.logger_ = container.logger;
    this.organisationService_ = container.organisationService;
    this.container_ = container;
  }

  async getWebConnectorData(
    org: Organisation,
    base_url: string,
    link_id: string
  ) {
    return Readable.from(this.crawlWebConnectorData(org, base_url, link_id));
  }

  async *crawlWebConnectorData(
    org: Organisation,
    base_url: string,
    link_id: string
  ): AsyncGenerator<IndexableDocument[]> {
    this.logger_.info(
      `Starting oculation of webConnector for ${org.id} organisation`
    );

    const oauth = await this.oauthService_.retrieve({
      id: org.id,
      app_name: AppNameDefinitions.WEBCONNECTOR,
    });

    if (!oauth) {
      this.logger_.error(
        `No WebConnector OAuth found for ${org.id} organisation`
      );
      return;
    }

    try {
      const pageArray = await this.crawl(base_url);
      let documents: IndexableDocument[] = [];
      for (const page of pageArray) {
        if (page.text) {
          const pageDocument: IndexableDocument = {
            id: page.location,
            organisationId: org.id,
            title: this.generateTitleFromParagraph(page.text),
            source: AppNameDefinitions.WEBCONNECTOR,
            sections: [
              {
                content: page.text,
                link: page.location,
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

      // const data = {
      //   link: base_url,
      //   link_id,
      //   emit_event: false,
      //   status: "success",
      // };
      // await this.organisationService_.updateInstalledApp(
      //   AppNameDefinitions.WEBCONNECTOR,
      //   data
      // );

      this.logger_.info(
        `Finished oculation of Web Connector for ${org.id} organisation`
      );
    } catch (error) {
      console.error(
        "Error fetching web commector content error from webconnector file:",
        error
      );
      // const data = {
      //   link: base_url,
      //   link_id,
      //   emit_event: false,
      //   status: "failed",
      // };
      // await this.organisationService_.updateInstalledApp(
      //   AppNameDefinitions.WEBCONNECTOR,
      //   data
      // );
    }
  }

  isValidUrl(url: string) {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Crawls a given URL and extracts text from specific HTML elements.
   *
   * @param base_url The base URL to start crawling from.
   * @returns An array of objects containing the page text and their respective URLs.
   */
  async crawl(
    base_url: string
  ): Promise<Array<{ text: string; location: string }>> {
    const browser: Browser = await puppeteer.launch({
      headless: true,
    });

    const page: Page = await browser.newPage();
    const visited_links: Set<string> = new Set();
    const pageTextArray: Array<{ text: string; location: string }> = [];
    console.log("BASE_URL", base_url);
    if (!this.isValidUrl(base_url)) {
      this.logger_.error("Invalid URL: " + base_url);
      await browser.close();
      return [];
    }

    const to_visit: string[] = [base_url];

    while (to_visit.length > 0) {
      const current_url: string | undefined = to_visit.pop();
      if (!current_url || visited_links.has(current_url)) continue;

      visited_links.add(current_url);
      const page_response = await page.goto(current_url, {
        waitUntil: "networkidle2",
      });

      let final_Url: string = page.url();
      if (final_Url !== current_url) {
        if (visited_links.has(final_Url)) continue;
        visited_links.add(final_Url);
      }

      const internal_links: Set<string> = await this.get_internal_links(
        base_url,
        final_Url,
        page
      );
      internal_links.forEach((link) => {
        if (!visited_links.has(link)) to_visit.push(link);
      });

      if (
        page_response &&
        ["4", "5"].includes(page_response.status().toString()[0])
      ) {
        this.logger_.info(
          `Skipped indexing ${current_url} due to HTTP ${page_response.status()} response`
        );
        continue;
      }

      const pageText: string = await page.evaluate(() => {
        const elements = Array.from(
          document.querySelectorAll("h1, h2, p, code")
        );
        return elements.reduce((result: string, element: HTMLElement) => {
          return result + element.innerText + "\n";
        }, "");
      });

      pageTextArray.push({ text: pageText, location: final_Url });
    }

    await browser.close();
    return pageTextArray;
  }

  async get_internal_links(
    base_url: string,
    current_url: string,
    page: Page
  ): Promise<Set<string>> {
    const hostname = new URL(base_url).hostname;

    const internalLinks = await page.evaluate((hostname) => {
      const links = Array.from(document.querySelectorAll("a[href]"));
      return links
        .map((link: any) => link.href)
        .filter((href) => {
          let url = new URL(href, document.baseURI);
          return url.hostname === hostname;
        });
    }, hostname);

    return new Set(internalLinks);
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
