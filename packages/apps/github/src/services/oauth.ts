import axios from "axios"
import randomize from "randomatic"
import { OauthService, AppNameDefinitions, AppCategoryDefinitions, OAuthToken  } from "@ocular-ai/types"
import { config } from "process"
import { Octokit } from "@octokit/rest"

class GithubOauth extends OauthService {

  protected client_id_: string
  protected client_secret_: string

  constructor(container, options) {
    super(arguments[0])
    this.client_id_ = options.client_id
    this.client_secret_ = options.client_secret
  }

  static getAppDetails(projectConfig,options) {
    const client_id = options.client_id
    const client_secret = options.client_secret
    const redirect = `${projectConfig.ui_cors}oauth/github`
    console.log("GitHub Oauth", client_id, client_secret, redirect)
    return {
      name: AppNameDefinitions.GITHUB,
      logo: "/Github.png",
      description: "GitHub is a web code hosting platform for version control and collaboration. It lets you and others work together on projects from anywhere.",
      install_url: `https://github.com/apps/ocular-ai/installations/new`,
      oauth_url: `https://github.com/login/oauth/authorize?client_id=${client_id}`,
      slug:AppNameDefinitions.GITHUB,
      category:AppCategoryDefinitions.SOTWARE_DEVELOPMENT,
      developer:"Ocular AI",
      images:["/Github.png"],
      overview: "GitHub is a web-based platform used for version control. Git simplifies the process of working with other people and makes it easy to collaborate on projects. Team members can work on files and easily merge their changes in with the master branch of the project.",
      docs: "https://docs.github.com/en",
      website: "https://github.com"
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
    try {
      const response = await axios.post('https://github.com/login/oauth/access_token', {
        client_id: this.client_id_,
        client_secret: this.client_secret_,
        code: code
      }, {
        headers: {
          accept: 'application/json'
        }
      });
  
      if (response.data.error) {
        throw new Error(`Failed to get access token: ${response.data.error_description}`);
      }

      return {
        type: response.data.token_type,
        token : response.data.access_token,
        token_expires_at : new Date(Date.now() + response.data.expires_in * 1000),
        refresh_token: response.data.refresh_token,
        refresh_token_expires_at: new Date(Date.now() + response.data.refresh_token_expires_in * 1000),
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export default GithubOauth;