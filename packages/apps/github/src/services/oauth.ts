import axios from "axios"
import randomize from "randomatic"
import { OauthService, AppNameDefinitions } from "@ocular-ai/types"
import { config } from "process"

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
    const state = randomize("A0", 16)
    const redirect = `${projectConfig.ui_cors}oauth/github`
    return {
      name: AppNameDefinitions.GITHUB,
      identifier: AppNameDefinitions.GITHUB,
      logo: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
      description: "GitHub is a web code hosting platform for version control and collaboration. It lets you and others work together on projects from anywhere.",
      website: "https://github.com",
      install_url: `https://github.com/apps/ocular-ai/installations/new`,
      oauth_url: `https://github.com/login/oauth/authorize?client_id=${client_id}&state=${state}`,
      state,
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

  async generateToken(code: string) {
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
  
      return response.data.access_token;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export default GithubOauth;