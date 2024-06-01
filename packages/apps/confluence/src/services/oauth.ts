import axios from 'axios';
import {
  OauthService,
  AppNameDefinitions,
  AppCategoryDefinitions,
  OAuthToken,
} from '@ocular/types';
import { ConfigModule } from '@ocular/ocular/src/types';

class ConfluenceOauth extends OauthService {
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
      name: AppNameDefinitions.CONFLUENCE,
      logo: '/confluence.svg',
      description:
        'Create, organize, and share work with AI by your side. Turn scattered information into a single source of truth.',
      oauth_url: `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${client_id}&scope=read%3Acontent%3Aconfluence%20read%3Acontent-details%3Aconfluence%20read%3Aspace-details%3Aconfluence%20read%3Aaudit-log%3Aconfluence%20read%3Apage%3Aconfluence%20read%3Aattachment%3Aconfluence%20read%3Ablogpost%3Aconfluence%20read%3Acomment%3Aconfluence%20read%3Acustom-content%3Aconfluence%20read%3Atemplate%3Aconfluence%20read%3Alabel%3Aconfluence%20read%3Awatcher%3Aconfluence%20read%3Aspace.property%3Aconfluence%20read%3Aspace%3Aconfluence%20read%3Acontent.metadata%3Aconfluence%20read%3Ainlinetask%3Aconfluence%20read%3Atask%3Aconfluence%20read%3Awhiteboard%3Aconfluence%20read%3Aapp-data%3Aconfluence%20offline_access&redirect_uri=${encodeURIComponent(
        redirect
      )}&response_type=code&prompt=consent`,
      slug: AppNameDefinitions.CONFLUENCE,
      auth_strategy: auth_strategy,
      category: AppCategoryDefinitions.PRODUCTIVITY,
      developer: 'Ocular AI',
      images: ['/confluence.svg'],
      overview:
        'Confluence is a team workspace where knowledge and collaboration meet. Dynamic pages give your team a place to create, capture, and collaborate on any project or idea.',
      docs: 'https://developer.atlassian.com/',
      website: 'https://www.atlassian.com/software/confluence',
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
      .post('https://auth.atlassian.com/oauth/token', body, config)
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
      .post('https://auth.atlassian.com/oauth/token', body, config)
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

export default ConfluenceOauth;
