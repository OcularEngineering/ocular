/**
 * @enum
 * 
 * Apps To Installed in the DB.
 */
export enum AppNameDefinitions {
  /**
   * GitHub
   */
  ASANA="asana",
  CONFLUENCE = "confluence",
  GITHUB = "github",
  GMAIL = "gmail",
  GOOGLEDRIVE = "google-drive",
  JIRA = "jira",
  NOTION = "notion",
  SLACK= "slack"
}

export enum AppCategoryDefinitions {
  /**
   * GitHub
   */
  SOTWARE_DEVELOPMENT = "Software Development",
  FILE_STORAGE = "File Storage",
  PRODUCTIVITY = "Productivity",
  DOCUMENTATION = "Documentation",
  MESSAGING = "Messaging"
}


export type InstalledApp = {
  id?: string;
  name?: string;
  installation_id?: string;
  permissions?: Record<string, string>;
}
