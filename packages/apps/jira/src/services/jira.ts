import fs from "fs";
import axios from "axios";
import { Readable } from "stream";
import { OAuthService, Organisation, RateLimiterService } from "@ocular/ocular";
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

export default class JiraService extends TransactionBaseService {
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
    this.requestQueue_ = this.rateLimiterService_.getRequestQueue(AppNameDefinitions.JIRA);
  }

  async getJiraData(org: Organisation) {
    return Readable.from(this.getJiraProjectsAndIssues(org));
  }

  async *getJiraProjectsAndIssues(
    org: Organisation
  ): AsyncGenerator<IndexableDocument[]> {
    this.logger_.info(`Starting oculation of Jira for ${org.id} organisation`);

    // Get Confluence OAuth for the organisation
    const oauth = await this.oauthService_.retrieve({
      id: org.id,
      app_name: AppNameDefinitions.JIRA,
    });

    if (!oauth) {
      this.logger_.error(`No Jira OAuth found for ${org.id} organisation`);
      return;
    }

    const config: Config = {
      headers: {
        Authorization: `Bearer ${oauth.token}`,
        Accept: "application/json",
      },
    };

    let documents: IndexableDocument[] = [];

    try {
      const { cloudID, url } = await this.fetchJiraCloudID(config);

      const jiraProjects = await this.fetchJiraProjects(cloudID, config);

      for (const project of jiraProjects) {
        const issues = await this.fetchProjectIssues(
          project.id,
          cloudID,
          config
        );
        for (const issue of issues) {
          const { description, updatedAt, title, key, id } =
            await this.fetchIssueDetails(issue.id, cloudID, config);
          const issueDoc: IndexableDocument = {
            id: id,
            organisationId: org.id,
            title: title,
            source: AppNameDefinitions.JIRA,
            sections: [
              {
                content: description,
                link: `${url}/browse/${key}`,
              },
            ],
            type: DocType.TEXT,
            updatedAt: new Date(updatedAt),
            metadata: {
              project_id:project.id,
              project_name: project.name,
              project_link:project.link,
              project_description: project.description
            },
          };
          documents.push(issueDoc);
          if (documents.length >= 100) {
            yield documents;
            documents = [];
          }
        }

        const jqlQuery = `project = "OT" ORDER BY created DESC`;

        // Add Project To Documents
        const projectDoc: IndexableDocument = {
          id: project.id,
          organisationId: org.id,
          title: project.name,
          source: AppNameDefinitions.JIRA,
          sections: [
            {
              content: project.description,
              link: `${url}/jira/software/projects/${
                project.key
              }/issues?jql=${encodeURIComponent(jqlQuery)}`,
            },
          ],
          type: DocType.TEXT,
          updatedAt: new Date(),

          metadata: {},
        };
        documents.push(projectDoc);
      }

      yield documents;
      await this.oauthService_.update(oauth.id, {
        last_sync: new Date(),
      });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // Check if it's an unauthorized error
        this.logger_.info(`Refreshing Jira token for ${org.id} organisation`);

        // Refresh the token
        const oauthToken = await this.container_["jiraOauth"].refreshToken(
          oauth.refresh_token
        );

        // Update the OAuth record with the new token
        await this.oauthService_.update(oauth.id, oauthToken);

        // Retry the request
        return this.getJiraProjectsAndIssues(org);
      } else {
        console.error(error);
      }
    }

    this.logger_.info(`Finished oculation of Jira for ${org.id} organisation`);
  }

  /**
   *
   * Fetches the Cloud ID for the Jira Cloud instance.
   *
   * @returns {Promise<string>} The Cloud ID.
   * @throws {Error} Throws an error if fetching the Cloud ID fails.
   */
  async fetchJiraCloudID(config: Config) {
    try {
      // Fetch accessible resources from Atlassian API
      const response = await axios.get(
        "https://api.atlassian.com/oauth/token/accessible-resources",
        config
      );

      // Validate response data
      const accessibleResources = response.data;
      if (!accessibleResources || accessibleResources.length === 0) {
        throw new Error("No accessible resources found.");
      }
      // Extract Cloud ID
      const cloudID = accessibleResources[0].id;
      const url = accessibleResources[0].url;

      if (!cloudID) {
        this.logger_.error("Invalid cloud ID.");
        throw new Error("Invalid cloud ID.");
      }

      return { cloudID, url };
    } catch (error) {
      console.error("Error fetching Jira Cloud ID:", error);
      // Consider custom error handling or logging here before throwing
      throw new Error("Failed to fetch Jira Cloud ID.");
    }
  }

  /**
   * Fetches Jira projects from a specified cloud ID.
   *
   * @param {string} cloudID The Cloud ID for the Jira instance.
   * @param {object} config Configuration object for the request, including headers.
   * @returns {Promise<Array>} A promise that resolves to an array of project objects.
   */
  async fetchJiraProjects(cloudID: string, config: Config) {
    // Block Until Rate Limit Allows Request
    await this.requestQueue_.removeTokens(1,AppNameDefinitions.JIRA)
    // Ensure the variable names are case-sensitive and consistent.
    const projectEndpoint = `https://api.atlassian.com/ex/jira/${cloudID}/rest/api/3/project/search`;

    try {
      // Using await within try-catch block for error handling
      const projectResponse = await axios.get(projectEndpoint, config);

      // Validate the response structure
      if (
        !projectResponse.data ||
        !Array.isArray(projectResponse.data.values)
      ) {
        return []; // Return an empty array or throw an error as per your error handling policy
      }

      // Use concise arrow function syntax for mapping
      const projects = projectResponse.data.values.map((project) => ({
        id: project.id,
        key: project.key,
        name: project.name,
        description: project.description,
        link: project.self
      }));

      return projects;
    } catch (error) {
      // Proper error logging with clear indication of the function where it occurred
      this.logger_.error(
        "Error fetching Jira projects in fetchJiraProjects:",
        error
      );
      throw error; // Rethrowing allows the caller to handle the error further
    }
  }

  /**
   * Fetches issues for a specific project.
   *
   * @param {string} projectID - The ID of the project.
   * @param {string} cloudID - The ID of the Jira Cloud instance.
   * @param {Object} config - Configuration object for HTTP request headers.
   * @returns {Promise<Object[]>} An array of issues with ids and keys.
   * @throws {Error} Throws an error if fetching issues fails.
   */
  async fetchProjectIssues(projectID, cloudID, config) {
    try {
      // Block Until Rate Limit Allows Request
      await this.requestQueue_.removeTokens(1,AppNameDefinitions.JIRA)
      // Construct base URL and issue endpoint
      const baseUrl = `https://api.atlassian.com/ex/jira/${cloudID}`;
      const issueEndpoint = `${baseUrl}/rest/api/3/search?jql=project=${projectID}&maxResults=1000`;

      // Fetch issues from Jira API
      const issueResponse = await axios.get(issueEndpoint, config);

      // Extract issues from the response data
      const issuesArray = issueResponse.data.issues || [];
      const issues = issuesArray.map((issue) => ({
        id: issue.id,
        key: issue.key,
        name: issue.name,
      }));

      return issues;
    } catch (error) {
      console.error("Error fetching project issues:", error.message);
      // Consider custom error handling or logging here before re-throwing
      throw new Error("Failed to fetch project issues.");
    }
  }

  /**
   * Fetches details of a specific issue from Jira.
   *
   * @param {string} issueID - The ID of the issue.
   * @param {string} cloudID - The ID of the Jira Cloud instance.
   * @param {Object} config - Configuration object for HTTP request headers.
   * @returns {Promise<{ description: string, updatedAt: string, title: string }>} The description, last updated date, and title of the issue.
   * @throws {Error} Throws an error if fetching issue details fails.
   */
  async fetchIssueDetails(issueID: string, cloudID: string, config: Config) {
    try {
      // Block Until Rate Limit Allows Request
      await this.requestQueue_.removeTokens(1,AppNameDefinitions.JIRA)
      // Construct the issue endpoint URL
      const baseUrl = `https://api.atlassian.com/ex/jira/${cloudID}`;
      const issueEndpoint = `${baseUrl}/rest/api/3/issue/${issueID}`;

      // Fetch issue details from Jira API
      const response = await axios.get(issueEndpoint, config);

      // Extract details from the response data
      const { data } = response;
      const { fields } = data;

      const description = this.extractDescription(fields)+ this.extractComments(fields);
      const updatedAt = fields.updated;
      const title = fields.summary;
      const key = data.key;
      const id = data.id;

      // Return the extracted details
      return { description, updatedAt, title, key, id };
    } catch (error) {
      console.error("Error fetching issue details:", error.message);
      // Consider custom error handling or logging here before re-throwing
      throw new Error("Failed to fetch issue details.");
    }
  }

  /**
   * Extracts the description from the issue response data.
   *
   * @param {Object} fields - The response data from the Jira API.
   * @returns {string} The description of the issue.
   */
  extractDescription(fields: any) {
    // Check if the description field exists and has content
    if (fields.description) {
      // Extract the content of the description field
      const descriptionContent = fields.description.content || [];

      // Concatenate text elements from paragraph content
      let issueDescription = "";
      descriptionContent.forEach((element) => {
        if (element.type === "paragraph") {
          const paragraphContent = element.content || [];
          paragraphContent.forEach((innerElement) => {
            if (innerElement.type === "text" && innerElement.text) {
              issueDescription += innerElement.text + " ";
            }
          });
        }
      });

      // Trim extra whitespace and return the description
      return issueDescription.trim();
    } else {
      // If description field is missing or empty, return an empty string
      return "";
    }
  }

  extractComments(fields: any) {
    if(fields.comments) {
      const commentContent = fields.comments.body.content || [];

      let commentDescription = "";
      commentContent.forEach((element) => {
        if (element.type === "paragraph") {
          const paragraphContent = element.content || [];
          paragraphContent.forEach((innerElement) => {
            if (innerElement.type === "text" && innerElement.text) {
              commentDescription += innerElement.text + " ";
            }
          });
        }
      })

      return commentDescription.trim();
    }else{
      return "";
    }
  }
}
