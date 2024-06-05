import axios from "axios";
import {
  OauthService,
  AppNameDefinitions,
  AppCategoryDefinitions,
  OAuthToken,
  AppAuthStrategy,
  TokenTypes,
} from "@ocular/types";
import { ConfigModule } from "@ocular/ocular/src/types";

class webConnectorOauth extends OauthService {
  protected client_id_: string;
  protected client_secret_: string;
  protected configModule_: ConfigModule;
  protected redirect_uri_: string;
  protected auth_strategy_: AppAuthStrategy;

  constructor(container, options) {
    super(arguments[0]);
    this.client_id_ = options.client_id;
    this.client_secret_ = options.client_secret;
    this.redirect_uri_ = options.redirect_uri;
    this.auth_strategy_ = options.auth_strategy;
    this.configModule_ = container.configModule;
  }

  static getAppDetails(projectConfig, options) {
    const client_id = options.client_id;
    const client_secret = options.client_secret;
    const redirect = options.redirect_uri;
    const auth_strategy = options.auth_strategy;
    return {
      name: AppNameDefinitions.WEBCONNECTOR,
      logo: "/web-connector.svg",
      description:
        "WebConnector: Your Gateway to Efficient Web Data Extraction",
      oauth_url: "",
      slug: AppNameDefinitions.WEBCONNECTOR,
      category: AppCategoryDefinitions.SOTWARE_DEVELOPMENT,
      developer: "Ocular AI",
      images: ["/web-connector.svg"],
      overview:
        "Web Connector: Effortlessly extract and index data from any website link into your database. Simplify data collection and boost productivity with our user-friendly app.",
      docs: "https://docs.useocular.com/overview",
      auth_strategy: auth_strategy,
      website: "https://www.useocular.com/",
    };
  }

  async generateToken(code: string): Promise<OAuthToken> {
    console.log("***** Generating token from the code:\n");

    const fakeToken: OAuthToken = {
      type: TokenTypes.BEARER,
      token: "Fake Token for Web Connector",
      token_expires_at: new Date(),
      refresh_token_expires_at: new Date(),
      refresh_token: "Fake Refresh Token",
      auth_strategy: AppAuthStrategy.OAUTH_TOKEN_STRATEGY,
      metadata: {},
    } as OAuthToken;

    return fakeToken;
  }
}

export default webConnectorOauth;
