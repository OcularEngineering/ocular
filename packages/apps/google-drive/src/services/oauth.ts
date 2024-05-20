const { google } = require("googleapis");
import randomize from "randomatic";
import {
  OauthService,
  AppNameDefinitions,
  AppCategoryDefinitions,
  OAuthToken,
} from "@ocular/types";
import { config } from "process";
import { OAuth2Client } from "google-auth-library";

class GoogleDriveOauth extends OauthService {
  protected client_id_: string;
  protected client_secret_: string;
  protected oauth2Client_: OAuth2Client;

  constructor(container, options) {
    super(arguments[0]);
    this.client_id_ = options.client_id;
    this.client_secret_ = options.client_secret;
    this.oauth2Client_ = new google.auth.OAuth2(
      options.client_id,
      options.client_secret,
      options.redirect_uri
    );
  }

  static getAppDetails(projectConfig, options) {
    const scopes = ["https://www.googleapis.com/auth/drive.readonly"];
    const oauth2Client = new google.auth.OAuth2(
      options.client_id,
      options.client_secret,
      options.redirect_uri
    );
    const authorizeUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: scopes.join(" "),
    });
    const client_id = options.client_id;
    const client_secret = options.client_secret;
    const redirect = `${projectConfig.ui_cors}oauth/github`;
    return {
      name: AppNameDefinitions.GOOGLEDRIVE,
      logo: "/google-drive.png",
      description:
        "Google Drive is a free service from Google that allows you to store files online.",
      install_url: null,
      oauth_url: authorizeUrl,
      slug: AppNameDefinitions.GOOGLEDRIVE,
      category: AppCategoryDefinitions.FILE_STORAGE,
      developer: "Ocular AI",
      images: ["/google-drive.png"],
      overview:
        "Google Drive is a free service from Google that allows you to store files online and access them anywhere using the cloud. Google Drive also gives you access to free web-based applications for creating documents, spreadsheets, presentations, and more.",
      docs: "https://docs.google.com/document/u/0/?ec=asw-docs-globalnav-goto",
      website: "https://www.google.com/docs/about/",
    };
  }

  async refreshToken(refresh_token: string): Promise<OAuthToken> {
    try {
      await this.oauth2Client_.setCredentials({ refresh_token: refresh_token });
      const newToken = await this.oauth2Client_.refreshAccessToken();
      const accessToken = newToken.credentials.access_token;
      return {
        token: accessToken,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async generateToken(code: string): Promise<OAuthToken> {
    try {
      const { tokens } = await this.oauth2Client_.getToken(code);
      return {
        type: tokens.token_type,
        token: tokens.access_token,
        token_expires_at: new Date(tokens.expiry_date),
        refresh_token: tokens.refresh_token,
        refresh_token_expires_at: new Date(Date.now() + 172800000),
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getOauthCLient(): Promise<OAuth2Client> {
    return this.oauth2Client_;
  }
}

export default GoogleDriveOauth;
