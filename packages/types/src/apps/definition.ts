/**
 * @enum
 * 
 * Apps To Installed in the DB.
 */
export enum AppNameDefinitions {
  /**
   * GitHub
   */
  GITHUB = "github",
}

export enum AppCategoryDefinitions {
  /**
   * GitHub
   */
  SOTWARE_DEVELOPMENT = "Software Development",
}


export type InstalledApp = {
  id?: string;
  name?: string;
  installation_id?: string;
  permissions?: Record<string, string>;
}
