import axios from "axios";
import randomize from "randomatic";
import {
  AppauthorizationService,
  AppNameDefinitions,
  AppCategoryDefinitions,
  AuthToken,
  AuthStrategy,
  Logger,
} from "@ocular/types";
import { config } from "process";
const { createAppAuth } = require("@octokit/auth-app");
import fs from "fs";
import { Octokit } from "octokit";

class GithubOauth extends AppauthorizationService {
  protected client_id_: string;
  protected client_secret_: string;
  protected redirect_uri_: string;
  protected app_id_: string;
  protected private_key_: string;
  protected logger_: Logger;

  constructor(container, options) {
    super(arguments[0]);
    this.client_id_ = options.client_id;
    this.client_secret_ = options.client_secret;
    this.redirect_uri_ = options.redirect_uri;
    this.app_id_ = options.app_id;
    this.private_key_ = options.private_key;
    this.logger_ = container.logger;
  }

  static getAppDetails(projectConfig, options) {
    const client_id = options.client_id;
    const client_secret = options.client_secret;
    const redirect = options.redirect_uri;
    const auth_strategy = options.auth_strategy;
    return {
      name: AppNameDefinitions.GITHUB,
      logo: "/github.svg",
      description:
        "GitHub is a web code hosting platform for version control and collaboration. It lets you and others work together on projects from anywhere.",
      oauth_url: `https://github.com/apps/ocular-ai/installations/new`,
      slug: AppNameDefinitions.GITHUB,
      auth_strategy: auth_strategy,
      category: AppCategoryDefinitions.SOTWARE_DEVELOPMENT,
      developer: "Ocular AI",
      images: ["/github.svg"],
      overview:
        "GitHub is a web-based platform used for version control. Git simplifies the process of working with other people and makes it easy to collaborate on projects. Team members can work on files and easily merge their changes in with the master branch of the project.",
      docs: "https://docs.github.com/en",
      website: "https://github.com",
    };
  }

  async generateToken(
    code: string,
    installation_id?: string
  ): Promise<AuthToken> {
    try {
      const octokit = new Octokit({
        auth: code,
      });
      const token = octokit.rest.users.getAuthenticated().then((res) => {
        return {
          type: "Bearer",
          token: code,
          token_expires_at: new Date(Date.now()),
          refresh_token: "",
          refresh_token_expires_at: new Date(Date.now() + 172800000),
          auth_strategy: AuthStrategy.API_TOKEN_STRATEGY,
        } as AuthToken;
      });
      return token;
    } catch (error) {
      this.logger_.error(
        "generatingToken: Error generationg token for Github with: " +
          error.message
      );
      throw error;
    }
  }
}

export default GithubOauth;
