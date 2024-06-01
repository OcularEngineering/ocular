import axios from "axios"
import randomize from "randomatic"
import { OauthService, AppNameDefinitions, AppCategoryDefinitions, OAuthToken  } from "@ocular/types"
import { config } from "process"
const { createAppAuth } = require("@octokit/auth-app");
import fs from 'fs';

class GithubOauth extends OauthService {

  protected client_id_: string
  protected client_secret_: string
  protected redirect_uri_: string
  protected app_id_: string
  protected private_key_: string

  constructor(container, options) {
    super(arguments[0])
    this.client_id_ = options.client_id
    this.client_secret_ = options.client_secret
    this.redirect_uri_ = options.redirect_uri
    this.app_id_ = options.app_id
    this.private_key_ = options.private_key
   }

   static getAppDetails(projectConfig,options) {
    const client_id = options.client_id
    const client_secret = options.client_secret
    const redirect = options.redirect_uri
    const auth_strategy = options.auth_strategy;
    return {
      name: AppNameDefinitions.GITHUB,
      logo: "/github.svg",
      description: "GitHub is a web code hosting platform for version control and collaboration. It lets you and others work together on projects from anywhere.",
      oauth_url: `https://github.com/apps/ocular-ai/installations/new`,
      slug:AppNameDefinitions.GITHUB,
      auth_strategy: auth_strategy,
      category:AppCategoryDefinitions.SOTWARE_DEVELOPMENT,
      developer:"Ocular AI",
      images:["/github.svg"],
      overview: "GitHub is a web-based platform used for version control. Git simplifies the process of working with other people and makes it easy to collaborate on projects. Team members can work on files and easily merge their changes in with the master branch of the project.",
      docs: "https://docs.github.com/en",
      website: "https://github.com"
    }
  }


  // async refreshToken(refresh_token: string): Promise<OAuthToken> {
  //   try {
  //     await this.oauth2Client_.setCredentials({ refresh_token: refresh_token });
  //     const newToken = await this.oauth2Client_.refreshAccessToken();
  //     const accessToken = newToken.credentials.access_token;
  //     return {
  //       token : accessToken,
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     throw error;
  //   }
  // }

  async generateToken(code: string, installation_id?:string): Promise<OAuthToken> {
    try {
      const auth = new createAppAuth({
        appId: this.app_id_,
        installationId: installation_id,
        privateKey: fs.readFileSync(this.private_key_, "utf-8"),
        oauth:{
          clientId: this.client_id_,
          clientSecret: this.client_secret_,
        }
      });

      // Check With Server That The Installaion ID is Valid.
      const appAuthentication = await auth({ type: "app" });
      const response = await axios.post(`https://api.github.com/app/installations/${installation_id}/access_tokens`, {}, {
          headers: {
            'Accept': 'application/vnd.github+json',
            'Authorization': `Bearer ${appAuthentication.token}`,
            'X-GitHub-Api-Version': '2022-11-28'
          }
        });
    
      return {
        type: "Bearer",
        token : response.data.token,
        token_expires_at : new Date(response.data.expires_at),
        refresh_token: "",
        refresh_token_expires_at: new Date(response.data.expires_at),
        metadata: {
          installation_id: installation_id
        }
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export default GithubOauth;