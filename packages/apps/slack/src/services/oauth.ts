import axios from 'axios';
import {
  OauthService,
  AppNameDefinitions,
  AppCategoryDefinitions,
  OAuthToken,
} from '@ocular/types';
import { ConfigModule } from '@ocular/ocular/src/types';

class SlackOauth extends OauthService {
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
    return {
      name: AppNameDefinitions.SLACK,
      logo: '/slack.svg',
      description:
        'Slack is a new way to communicate with your team. Its faster, better organised and more secure than email.',
      oauth_url: `https://slack.com/oauth/v2/authorize?client_id=${client_id}&scope=app_mentions:read,channels:history,channels:join,channels:manage,channels:read,chat:write.customize,chat:write.public,chat:write,files:read,files:write,groups:history,groups:read,groups:write,im:history,im:read,im:write,links:read,links:write,mpim:history,mpim:read,mpim:write,pins:read,pins:write,reactions:read,reactions:write,reminders:read,reminders:write,team:read,usergroups:read,usergroups:write,users:read,users:write,users.profile:read&user_scope=`,
      slug: AppNameDefinitions.SLACK,
      category: AppCategoryDefinitions.PRODUCTIVITY,
      developer: 'Ocular AI',
      images: ['/slack.svg'],
      overview:
        'Slack is a new way to communicate with your team. Its faster, better organised and more secure than email.',
      docs: 'https://api.slack.com/docs',
      website: 'https://slack.com/',
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
      .post('https:/slack.com/api/oauth.v2.exchange', body, config)
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
      .post('https:/slack.com/api/oauth.v2.exchange', body, config)
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

export default SlackOauth;
