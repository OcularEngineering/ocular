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

class JiarOauth extends AppauthorizationService {
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
      name: AppNameDefinitions.JIRA,
      logo: "/jira.svg",
      description:
        "Make the impossible, possible in Jira. Plan, track, and release world-class software with the number one project management tool for agile teams.",
      oauth_url: `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${client_id}&scope=read%3Aaudit-log%3Ajira%20read%3Aissue%3Ajira%20read%3Aissue-meta%3Ajira%20read%3Aattachment%3Ajira%20read%3Acomment%3Ajira%20read%3Acustom-field-contextual-configuration%3Ajira%20read%3Afield-configuration%3Ajira%20read%3Afield.options%3Ajira%20read%3Aissue-link%3Ajira%20read%3Aissue-link-type%3Ajira%20read%3Apriority%3Ajira%20read%3Aissue.property%3Ajira%20read%3Aissue.remote-link%3Ajira%20read%3Aresolution%3Ajira%20read%3Aissue-details%3Ajira%20read%3Aissue-worklog.property%3Ajira%20read%3Aissue-worklog%3Ajira%20read%3Aissue-status%3Ajira%20read%3Aissue-type-hierarchy%3Ajira%20read%3Aissue-type-transition%3Ajira%20read%3Aissue.changelog%3Ajira%20read%3Aissue.transition%3Ajira%20read%3Aissue-event%3Ajira%20read%3Ajira-expressions%3Ajira%20read%3Aproject%3Ajira%20read%3Aproject-category%3Ajira%20read%3Aproject.component%3Ajira%20read%3Aproject.property%3Ajira%20read%3Aproject.feature%3Ajira%20read%3Ascreen%3Ajira%20read%3Ascreen-scheme%3Ajira%20read%3Ascreen-field%3Ajira%20read%3Ainstance-configuration%3Ajira%20read%3Aproject-type%3Ajira%20read%3Aproject.email%3Ajira%20read%3Aissue-adjustments%3Ajira%20read%3Aremote-link-info%3Ajira%20read%3Acmdb-object%3Ajira%20read%3Acmdb-schema%3Ajira%20read%3Aavatar%3Ajira%20read%3Aissue-type%3Ajira%20read%3Auser%3Ajira%20read%3Aapplication-role%3Ajira%20read%3Agroup%3Ajira%20read%3Aproject-version%3Ajira%20read%3Aissue-security-level%3Ajira%20read%3Aissue.vote%3Ajira%20read%3Astatus%3Ajira%20offline_access&redirect_uri=${encodeURIComponent(
        redirect
      )}&response_type=code&prompt=consent`,
      slug: AppNameDefinitions.JIRA,
      auth_strategy: auth_strategy,
      category: AppCategoryDefinitions.PRODUCTIVITY,
      developer: "Ocular AI",
      images: ["/jira.svg"],
      overview:
        "Make the impossible, possible in Jira. Plan, track, and release world-class software with the number one project management tool for agile teams.",
      docs: "https://developer.atlassian.com/",
      website: "https://www.atlassian.com/software/jira",
    };
  }

  async refreshToken(refresh_token: string): Promise<AuthToken> {
    const body = {
      grant_type: "refresh_token",
      client_id: this.client_id_,
      client_secret: this.client_secret_,
      refresh_token: refresh_token,
    };

    const config = {
      headers: {
        "content-type": "application/json",
      },
    };

    return axios
      .post("https://auth.atlassian.com/oauth/token", body, config)
      .then((res) => {
        return {
          token: res.data.access_token,
          token_expires_at: new Date(Date.now() + res.data.expires_in * 1000),
          refresh_token: res.data.refresh_token,
        } as AuthToken;
      })
      .catch((err) => {
        console.error(err);
        throw err;
      });
  }

  async generateToken(code: string, metadata: any): Promise<AuthToken> {
    console.log("***** Generating token from the code:\n");
    console.log("metadata of Jira App: ", metadata);

    if (this.auth_strategy_ === AuthStrategy.API_TOKEN_STRATEGY) {
      return {
        type: TokenTypes.BEARER,
        token: code,
        token_expires_at: new Date(),
        refresh_token: "NO_REFRESH_TOKEN",
        auth_strategy: AuthStrategy.API_TOKEN_STRATEGY,
        metadata: {
          username: metadata.username,
          domain: metadata.domain,
        },
      } as AuthToken;
    }

    const body = {
      grant_type: "authorization_code",
      client_id: `${this.client_id_}`,
      client_secret: `${this.client_secret_}`,
      code: code,
      redirect_uri: `${this.redirect_uri_}`,
    };

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    return axios
      .post("https://auth.atlassian.com/oauth/token", body, config)
      .then((res) => {
        return {
          type: res.data.token_type,
          token: res.data.access_token,
          token_expires_at: new Date(Date.now() + res.data.expires_in * 1000),
          refresh_token: res.data.refresh_token,
        } as AuthToken;
      })
      .catch((err) => {
        console.error(err);
        throw err;
      });
  }
}

export default JiarOauth;
