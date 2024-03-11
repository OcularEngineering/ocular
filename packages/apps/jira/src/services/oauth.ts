
import randomize from "randomatic"
import axios from "axios"
import { OauthService, AppNameDefinitions, AppCategoryDefinitions, OAuthToken  } from "@ocular-ai/types"
import { ConfigModule } from '@ocular-ai/core-backend/src/types';

class JiraOauth extends OauthService {
  protected client_id_: string
  protected client_secret_: string
  protected configModule_: ConfigModule

  constructor(container, options) {
    super(arguments[0])
    this.client_id_ = options.client_id
    this.client_secret_ = options.client_secret
    this.configModule_ = container.configModule
  }

  static getAppDetails(projectConfig,options) {
    const client_id = options.client_id
    const client_secret = options.client_secret
    const redirect = `${projectConfig.ui_cors}/oauth/confluence`
    return {
      name: AppNameDefinitions.JIRA,
      logo: "/jira.svg",
      description: "Make the impossible, possible in Jira. Plan, track, and release world-class software with the number one project management tool for agile teams.",
      oauth_url: `xxx`,
      slug:AppNameDefinitions.JIRA,
      category:AppCategoryDefinitions.PRODUCTIVITY,
      developer:"Ocular AI",
      images:["/jira.svg"],
      overview:"Make the impossible, possible in Jira. Plan, track, and release world-class software with the number one project management tool for agile teams.",
      docs: "https://confluence.atlassian.com/jira",
      website: "https://www.atlassian.com/software/jira"
    }
  }

  async refreshToken() {
    // const params = {
    //   refresh_token: refreshToken,
    //   client_id: "",
    //   client_secret: CLIENT_SECRET,
    // }

    console.log("refreshToken")

    // const data = await Brightpearl.refreshToken(this.account_, params)
    return "refreshToken"
  }

  async generateToken(code: string): Promise<OAuthToken> {

    console.log("***** Generating token from the code:\n");
    console.log(code);
    
    const body = {
      grant_type: "authorization_code",
      client_id: this.client_id_,
      client_secret: this.client_secret_,
      redirect_uri: `https://oauth.pstmn.io/v1/callback`,
      code: code,
    };
  
    const config = {
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
    };

   return axios
    .post("https://app.asana.com/-/oauth_token", 
      Object.keys(body)
    .map((key) => `${key}=${encodeURIComponent(body[key])}`)
    .join('&'), 
      config)
    .then((res) => {
      return {
        type: res.data.token_type,
        token : res.data.access_token,
        token_expires_at : new Date(Date.now() + res.data.expires_in * 1000),
        refresh_token: res.data.refresh_token,
        refresh_token_expires_at: new Date(Date.now() + 172800 * 1000),
      } as OAuthToken
    })
    .catch((err) => {
      console.error(err);
      throw err;
    });
  }
}

export default JiraOauth;