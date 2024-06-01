import axios from 'axios';
import {
  OauthService,
  AppNameDefinitions,
  AppCategoryDefinitions,
  OAuthToken,
} from '@ocular/types';
import { ConfigModule } from '@ocular/ocular/src/types';

class BitBucketOauth extends OauthService {
  protected client_id_: string;
  protected client_secret_: string;
  protected configModule_: ConfigModule;
  protected redirect_uri_: string;

  constructor(container, options) {
    super(arguments[0]);
    this.client_id_ = options.client_id;
    this.client_secret_ = options.client_secret;
    this.redirect_uri_ = options.redirect_uri;
    this.configModule_ = container.configModule;
  }

  static getAppDetails(projectConfig, options) {
    const client_id = options.client_id;
    const client_secret = options.client_secret;
    const redirect = options.redirect_uri;
    const auth_strategy = options.auth_strategy;
    return {
      name: AppNameDefinitions.BITBUCKET,
      logo: '/bitbucket.svg',
      description:
        'Bitbucket is a Git-based source code repository hosting service owned by Atlassian',
      oauth_url: `https://bitbucket.org/site/oauth2/authorize?client_id=${client_id}&response_type=code.`,
      slug: AppNameDefinitions.BITBUCKET,
      category: AppCategoryDefinitions.FILE_STORAGE,
      developer: 'Ocular AI',
      images: ['/bitbucket.svg'],
      auth_strategy: auth_strategy,
      overview:
        'Bitbucket is a Git-based source code repository hosting service owned by Atlassian',
      docs: 'https://developer.atlassian.com/cloud/bitbucket/rest',
      website: 'https://bitbucket.org/product/',
    };
  }

  async refreshToken(refresh_token: string): Promise<OAuthToken> {
    const body = {
      grant_type: 'refresh_token',
      client_id: this.client_id_,
      client_secret: this.client_secret_,
      refresh_token: refresh_token,
    };

    const config = {
      headers: {
        'content-type': 'application/json',
      },
    };

    return axios
      .post(`https://bitbucket.org/site/oauth2/access_token?grant_type=refresh_token&refresh_token=${refresh_token}`, body, config)
      .then((res) => {
        return {
          token: res.data.access_token,
          token_expires_at: new Date(Date.now() + res.data.expires_in * 1000),
          refresh_token: res.data.refresh_token,
        } as OAuthToken;
      })
      .catch((err) => {
        console.error(err);
        throw err;
      });
  }

  async generateToken(code: string): Promise<OAuthToken> {
    console.log('***** Generating token from the code:\n');

    const body = {
      grant_type: 'authorization_code',
      client_id: `${this.client_id_}`,
      client_secret: `${this.client_secret_}`,
      code: code,
      redirect_uri: `${this.redirect_uri_}`,
    };

    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    return axios
      .post(`https://bitbucket.org/site/oauth2/access_token?grant_type=authorization_code&code=${code}`, body, config)
      .then((res) => {
        return {
          type: res.data.token_type,
          token: res.data.access_token,
          token_expires_at: new Date(Date.now() + res.data.expires_in * 1000),
          refresh_token: res.data.refresh_token,
        } as OAuthToken;
      })
      .catch((err) => {
        console.error(err);
        throw err;
      });
  }
}

export default BitBucketOauth;
