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

class BitBucketAccessTokenAuth extends AppauthorizationService {
  protected configModule_: ConfigModule;
  protected auth_strategy_: AuthStrategy

  constructor(container, options) {
    super(arguments[0]);
    this.configModule_ = container.configModule;
    this.auth_strategy_ = options.auth_strategy;
  }

  static getAppDetails(projectConfig, options) {
    const auth_strategy = options.auth_strategy;
    return {
      name: AppNameDefinitions.BITBUCKET,
      logo: "/bitbucket.svg",
      description:
        "Bitbucket is a Git-based source code repository hosting service owned by Atlassian",
      slug: AppNameDefinitions.BITBUCKET,
      category: AppCategoryDefinitions.FILE_STORAGE,
      developer: "Ocular AI",
      images: ["/bitbucket.svg"],
      auth_strategy: auth_strategy,
      overview:
        "Bitbucket is a Git-based source code repository hosting service owned by Atlassian",
      docs: "https://developer.atlassian.com/cloud/bitbucket/rest",
      website: "https://bitbucket.org/product/",
    };
  }

  async generateToken(code: string): Promise<AuthToken> {
    return {
        type: TokenTypes.BEARER,
        auth_strategy: AuthStrategy.API_TOKEN_STRATEGY,
        token: code,
        refresh_token: "NO_REFRESH_TOKEN",
      } as AuthToken
  }
}

export default BitBucketAccessTokenAuth;
