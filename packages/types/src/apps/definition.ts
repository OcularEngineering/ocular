/**
 * @enum
 *
 * Apps To Installed in the DB.
 */
export enum AppNameDefinitions {
  /**
   * GitHub
   */
  ASANA = "asana",
  CONFLUENCE = "confluence",
  GITHUB = "github",
  GMAIL = "gmail",
  GOOGLEDRIVE = "google-drive",
  JIRA = "jira",
  NOTION = "notion",
  SLACK = "slack",
  WEBCONNECTOR = "webConnector",
  BITBUCKET = "bitbucket",
  OCULAR_API = "ocular-api",
}

export enum AppAuthStrategy {
  API_TOKEN_STRATEGY = "API Token Strategy",
  OAUTH_TOKEN_STRATEGY = "OAuth Token Stratgey",
}

export enum AppCategoryDefinitions {
  /**
   * GitHub
   */
  SOTWARE_DEVELOPMENT = "Software Development",
  FILE_STORAGE = "File Storage",
  PRODUCTIVITY = "Productivity",
  DOCUMENTATION = "Documentation",
  MESSAGING = "Messaging",
}

export type InstalledApp = {
  id?: string;
  name?: string;
  installation_id?: string;
  permissions?: Record<string, string>;
};
