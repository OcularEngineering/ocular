import randomize from "randomatic"
import { OauthService, AppNameDefinitions } from "@ocular-ai/types"
import { config } from "process"

class GithubOauth extends OauthService {

  constructor(container, options) {
    super(arguments[0])
  }

  static getAppDetails(projectConfig,options) {
    const client_id = projectConfig.client_id
    const client_secret = projectConfig.github_client_secret
    const state = randomize("A0", 16)
    const redirect = `${projectConfig.ui_cors}oauth/github`
    return {
      name: AppNameDefinitions.GITHUB,
      identifier: AppNameDefinitions.GITHUB,
      logo: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
      description: "GitHub is a web code hosting platform for version control and collaboration. It lets you and others work together on projects from anywhere.",
      website: "https://github.com",
      install_url: `https://github.com/login/oauth/authorize?client_id=${client_id}&response_type=code&scope=repo&redirect_uri=${redirect}&state=${state}`,
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

  async generateToken() {
    console.log("refreshToken")
    // const params = {
    //   client_id: "",
    //   client_secret: CLIENT_SECRET,
    //   redirect: "https://tekla.commerce.com/a/oauth/brightpearl",
    //   code,
    // }

    // const data = await Brightpearl.createToken(this.account_, params)
    // return data
    return "code"
  }

}

export default GithubOauth;