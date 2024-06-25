import { Organisation, RateLimiterService } from "@ocular/ocular";
import {
  IndexableDocument,
  Logger,
  AppNameDefinitions,
  DocType,
  Section,
} from "@ocular/types";
import axios from "axios";

interface JiraProject {
  id: string;
  key: string;
  name: string;
  description: string;
  lead: {
    account_id: string;
    display_name: string;
  };
  avatarUrls: {
    "48x48": string;
    "24x24": string;
  };
  url: string;
  last_updated: string;
}

interface IssueComment {
  author: {
    account_id: string;
    display_name: string;
  };
  body: string;
}

interface JiraIssue {
  key: string;
  description: string;
  comments: IssueComment[];
  status?: string;
  priority?: string;
  summary?: string;
  assignee?: {
    display_name: string;
    avatarUrls: {
      "48x48": string;
      "24x24": string;
    };
  };
}

class ApiTokenService {
  private jira_token_: string;
  private jira_domain_name_: string;
  private jira_user_name_: string;
  private headers_: any;
  private logger_: Logger;
  private org_: Organisation;
  private rateLimiterService_: RateLimiterService;
  private last_sync_: Date;

  constructor(
    token: string,
    domain_name: string,
    user_name: string,
    org: Organisation,
    logger: Logger,
    ratelimiterService: RateLimiterService,
    last_sync: Date | null
  ) {
    this.jira_token_ = token;
    this.jira_domain_name_ = domain_name;
    this.jira_user_name_ = user_name;
    this.headers_ = {
      Authorization: `Basic ${Buffer.from(
        `${this.jira_user_name_}:${this.jira_token_}`
      ).toString("base64")}`,
      Accept: "application/json",
    };
    this.logger_ = logger;
    this.org_ = org;
    this.rateLimiterService_ = ratelimiterService;
    this.last_sync_ = last_sync;
  }

  async jiraIndexDocs(): Promise<IndexableDocument[]> {
    const projectIndexableDocs: IndexableDocument[] = [];

    const jiraProjects = await this.fetchJiraProjects();

    for (const project of jiraProjects) {
      const last_updated = project.last_updated
        ? new Date(project.last_updated)
        : null;

      // Little buggy Need to be takes care of
      if (
        (this.last_sync_ && !last_updated) ||
        last_updated <= this.last_sync_
      ) {
        continue;
      }

      const issues = await this.fetchProjectIssues(project.id);

      const sections: Section[] = issues.map((issue) => ({
        content: this.formatJiraIssues([issue]),
        link: `${this.jira_domain_name_}/browse/${issue.key}`,
        metadata: this.generateIssueMetadata(issue),
      }));

      const projectDoc: IndexableDocument = {
        id: project.id,
        organisationId: this.org_.id,
        source: AppNameDefinitions.JIRA,
        title: project.name,
        sections,
        type: DocType.TXT,
        metadata: this.generateProjectMetadata(project),
        updatedAt: new Date(project.last_updated), // yet to be resolved
      };
      projectIndexableDocs.push(projectDoc);
    }

    return projectIndexableDocs;
  }

  /**
   * @typedef {Object} JiraProject
   * @property {string} id - The project ID.
   * @property {string} key - The project key.
   * @property {string} name - The project name.
   * @property {string} description - The project description.
   * @property {Object} lead - The project lead.
   * @property {string} lead.account_id - The account ID of the lead.
   * @property {string} lead.display_name - The display name of the lead.
   * @property {Object} avatarUrls - The avatar URLs.
   * @property {string} avatarUrls["48x48"] - The 48x48 avatar URL.
   * @property {string} avatarUrls["24x24"] - The 24x24 avatar URL.
   * @property {string} url - The project URL.
   */

  /**
   * Fetches Jira projects with pagination and returns them as an array of JiraProject objects.
   * @returns {Promise<JiraProject[]>} A promise that resolves to an array of JiraProject objects.
   */
  async fetchJiraProjects(): Promise<JiraProject[]> {
    const maxResults = 50;
    const projectDocs = [];
    let startAt = 0;

    try {
      while (true) {
        const params = { startAt, maxResults };
        const headers = this.headers_;

        const response = await axios.get(
          `https://${this.jira_domain_name_}/rest/api/2/project/search?expand=description,lead,url,insight`,
          { headers, params }
        );

        const projects = response.data.values;

        if (projects.length > 0) {
          const filteredProjectDocs = projects.map((project) => ({
            id: project.id,
            key: project.key,
            name: project.name,
            description: project.description,
            lead: {
              account_id: project.lead?.accountId,
              display_name: project.lead?.displayName,
            },
            avatarUrls: {
              "48x48": project.avatarUrls["48x48"],
              "24x24": project.avatarUrls["24x24"],
            },
            url: project.self,
            last_updated: project.insight?.lastIssueUpdateTime || null,
          }));
          projectDocs.push(...filteredProjectDocs);
        }
        startAt += projects.length;
        if (response.data.isLast) {
          break;
        }
      }

      return projectDocs;
    } catch (error) {
      this.logger_.error(
        `jiraProjects: Failed to fetch Jira projects: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Fetches issues for a specific Jira project with pagination.
   * @param {string} projectId - The ID of the Jira project.
   * @returns {Promise<JiraIssue[]>} A promise that resolves to an array of JiraIssue objects.
   */
  async fetchProjectIssues(projectId: string): Promise<JiraIssue[]> {
    const issueDocs: JiraIssue[] = [];
    const maxResults = 50;
    const headers = this.headers_;
    try {
      let startAt = 0;

      while (true) {
        const params = {
          startAt,
          maxResults,
          jql: `project = ${projectId}`,
        };

        const { data } = await axios.get(
          `https://${this.jira_domain_name_}/rest/api/2/search?fields=comment,assignee,status,priority,description,summary,project`,
          { headers, params }
        );

        const issuesArray = data.issues;

        if (issuesArray.length > 0) {
          const issues = issuesArray.map((issue: any) => {
            const issueFields = issue.fields;
            const jiraIssue: JiraIssue = {
              key: issue.key,
              description: issueFields.description,
              comments: issueFields.comment?.comments.map(
                (issueComment: any) => ({
                  author: {
                    account_id: issueComment.author?.accountId,
                    display_name: issueComment.author?.displayName,
                  },
                  body: issueComment.body,
                })
              ),
              status: issueFields.status?.name,
              priority: issueFields.priority?.name,
              summary: issueFields.summary,
              assignee: {
                display_name: issueFields.assignee?.displayName,
                avatarUrls: {
                  "48x48": issueFields.assignee?.avatarUrls["48x48"],
                  "24x24": issueFields.assignee?.avatarUrls["24x24"],
                },
              },
            };

            return jiraIssue;
          });

          issueDocs.push(...issues);
          startAt += issuesArray.length;
        }

        if (issuesArray.length < maxResults) {
          break;
        }
      }

      return issueDocs;
    } catch (error: any) {
      this.logger_.error(
        `fetchProjectIssues: Failed to fetch issues for project ${projectId}: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Formats an array of JiraIssue objects into a string.
   * @param {JiraIssue[]} issues - The array of JiraIssue objects.
   * @returns {string} The formatted string.
   */
  formatJiraIssues(issues: JiraIssue[]): string {
    return issues
      .map((issue) => {
        const commentsString = issue.comments
          .map((comment) => `${comment.author.display_name}: ${comment.body}`)
          .join(",\n");

        return `${issue.description}\n${commentsString}`;
      })
      .join("\n\n");
  }

  /**
   * Generates metadata from an array of JiraIssue objects.
   * @param {JiraIssue[]} issues - Array of JiraIssue objects.
   * @returns {Object[]} Array of metadata objects containing assignee, summary, priority, and status.
   */
  generateIssueMetadata(issue: JiraIssue): any {
    return {
      assignee: issue.assignee || {
        display_name: "No Assignee",
        avatarUrls: null,
      },
      summary: issue.summary || "No Summary",
      priority: issue.priority || "No Priority",
      status: issue.status || "No Status",
    };
  }

  /**
   * Generates metadata for a Jira project.
   * @param {JiraProject} project - A JiraProject objects.
   * @returns {Object} An array of metadata objects containing description, lead, and avatarUrls.
   */
  generateProjectMetadata(project: JiraProject) {
    return {
      description: project.description || "",
      lead: project.lead ? project.lead.display_name || "" : "",
      avatarUrls: project.avatarUrls
        ? {
            "48x48": project.avatarUrls["48x48"] || "",
            "24x24": project.avatarUrls["24x24"] || "",
          }
        : { "48x48": "", "24x24": "" },
    };
  }
}

export default ApiTokenService;
