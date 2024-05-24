import axios from "axios";
import {
  OauthService,
  AppNameDefinitions,
  AppCategoryDefinitions,
  OAuthToken,
} from "@ocular/types";
import { ConfigModule } from "@ocular/ocular/src/types";

class webConnectorOauth extends OauthService {
  protected client_id_: string;
  protected client_secret_: string;
  protected configModule_: ConfigModule;
  protected redirect_uri_: string;

  constructor(container, options) {
    super(arguments[0]);
    this.client_id_ = options.client_id;
    this.client_secret_ = options.client_secret;
    this.redirect_uri_ = options.redirect_uri;
    this.configModule_ = container.configModule;
  }

  static getAppDetails(projectConfig, options) {
    const client_id = options.client_id;
    const client_secret = options.client_secret;
    const redirect = options.redirect_uri;

    return {
      name: AppNameDefinitions.WEBCONNECTOR,
      logo: "/web-connecter.svg",
      description: "WebConnector",
      oauth_url: "",
      slug: AppNameDefinitions.WEBCONNECTOR,
      category: AppCategoryDefinitions.SOTWARE_DEVELOPMENT,
      developer: "Ocular AI",
      images: ["/web-connector.svg"],
      overview: "WebConnector",
      docs: "https://developer.atlassian.com/",
      website: "https://www.atlassian.com/software/confluence",
    };
  }

  async generateToken(code: string): Promise<OAuthToken> {
    console.log("***** Generating token from the code:\n");

    const fakeToken: OAuthToken = {
      type: "Bearer",
      token: "Fake Token for Web Connector",
      token_expires_at: new Date(),
      refresh_token_expires_at: new Date(),
      refresh_token: "Fake Rfresh Token",
      metadata: {},
    };

    return fakeToken as OAuthToken;
  }
}

export default webConnectorOauth;
