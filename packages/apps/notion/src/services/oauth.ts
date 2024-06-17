import randomize from "randomatic";
import axios from "axios";
import {
  AppauthorizationService,
  AppNameDefinitions,
  AppCategoryDefinitions,
  AuthToken,
  AuthStrategy,
  TokenTypes,
} from "@ocular/types";
import { ConfigModule } from "@ocular/ocular/src/types";

class NotionOauth extends AppauthorizationService {
  protected client_id_: string;
  protected client_secret_: string;
  protected configModule_: ConfigModule;
  protected redirect_uri_: string;
  protected auth_strategy_: AuthStrategy;

  constructor(container, options) {
    super(arguments[0]);
    this.client_id_ = options.client_id;
    this.client_secret_ = options.client_secret;
    this.redirect_uri_ = options.redirect_uri;
    this.configModule_ = container.configModule;
    this.auth_strategy_ = options.auth_strategy;
  }

  static getAppDetails(projectConfig, options) {
    const client_id = options.client_id;
    const client_secret = options.client_secret;
    const redirect = options.redirect_uri;
    const auth_strategy = options.auth_strategy;
    return {
      name: AppNameDefinitions.NOTION,
      logo: "/notion.svg",
      description:
        "Notion is a single space where you can think, write, and plan.",
      oauth_url: `https://api.notion.com/v1/oauth/authorize?client_id=${client_id}&response_type=code&owner=user&redirect_uri=${encodeURIComponent(
        redirect
      )}`,
      slug: AppNameDefinitions.NOTION,
      category: AppCategoryDefinitions.PRODUCTIVITY,
      developer: "Ocular AI",
      auth_strategy: auth_strategy,
      images: ["/notion.svg"],
      overview:
        "Notion is a single space where you can think, write, and plan. Capture thoughts, manage projects, or even run an entire company — and do it exactly the way you want.",
      docs: "https://developers.notion.com/",
      website: "https://www.notion.so/product",
    };
  }

  /**
   * Generates a new authentication token based on the provided token and the configured authentication strategy.
   *
   * @param {string} token - The token to generate the authentication token from.
   * @returns {Promise<AuthToken>} - A promise that resolves to the generated authentication token.
   * @throws {Error} - Throws an error if token generation fails.
   */
  public async generateToken(token: string): Promise<AuthToken> {
    console.log(
      `***** Generating ${this.auth_strategy_} token from the token: *****`
    );

    if (this.auth_strategy_ === AuthStrategy.API_TOKEN_STRATEGY) {
      // Stores API_INTEGRATION_TOKEN in the Database
      return {
        type: TokenTypes.BEARER,
        token: token,
        token_expires_at: new Date(),
        refresh_token: "NO_REFRESH_TOKEN",
        auth_strategy: AuthStrategy.API_TOKEN_STRATEGY, 
      };
    }

    // Stores OAuth access token in the Database
    const encoded = Buffer.from(
      `${this.client_id_}:${this.client_secret_}`
    ).toString("base64");

    const body = {
      grant_type: "authorization_code",
      redirect_uri: this.redirect_uri_,
      code: token,
    };

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${encoded}`,
      },
    };

    try {
      const response = await axios.post(
        "https://api.notion.com/v1/oauth/token",
        body,
        config
      );
      return {
        type: response.data.token_type as TokenTypes,
        token: response.data.access_token,
        token_expires_at: new Date(), 
        refresh_token: "NO_REFRESH_TOKEN",
        auth_strategy: AuthStrategy.OAUTH_TOKEN_STRATEGY,
        refresh_token_expires_at: new Date(),
      };
    } catch (error) {
      throw new Error(
        `generateToken: Error generating token for Notion with error: ${error.message}`
      );
    }
  }
}

export default NotionOauth;
