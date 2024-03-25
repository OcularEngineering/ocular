import randomize from 'randomatic';
import axios from 'axios';
import {
  OauthService,
  AppNameDefinitions,
  AppCategoryDefinitions,
  OAuthToken,
} from '@ocular/types';
import { ConfigModule } from '@ocular/ocular/src/types';

class NotionOauth extends OauthService {
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
    console.log(client_id);
    return {
      name: AppNameDefinitions.NOTION,
      logo: '/notion.svg',
      description:
        'Notion is a single space where you can think, write, and plan. Capture thoughts, manage projects, or even run an entire company — and do it exactly the way you want.',
      oauth_url: `https://api.notion.com/v1/oauth/authorize?client_id=${client_id}&response_type=code&owner=user&redirect_uri=${encodeURIComponent(
        redirect
      )}`,
      slug: AppNameDefinitions.NOTION,
      category: AppCategoryDefinitions.PRODUCTIVITY,
      developer: 'Ocular AI',
      images: ['/notion.svg'],
      overview:
        'Notion is a single space where you can think, write, and plan.',
      docs: 'https://developers.notion.com/',
      website: 'https://www.notion.so/product',
    };
  }

  async generateToken(code: string): Promise<OAuthToken> {
    console.log('***** Generating token from the code:\n');
    console.log(
      'CLIENT CRED',
      this.client_id_,
      this.client_secret_,
      this.redirect_uri_,
      code
    );
    const encoded = Buffer.from(
      `${this.client_id_}:${this.client_secret_}`
    ).toString('base64');

    const body = {
      grant_type: 'authorization_code',
      redirect_uri: this.redirect_uri_,
      code: code,
    };

    const config = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Basic ${encoded}`,
      },
    };

    return axios
      .post('https://api.notion.com/v1/oauth/token', body, config)
      .then((res) => {
        console.log('RESPONSE', res.data);
        return {
          type: res.data.token_type,
          token: res.data.access_token,
        } as OAuthToken;
      })
      .catch((err) => {
        console.log('THIS IS ERROR', err);

        // console.error(err);
        throw err;
      });
  }
}

export default NotionOauth;
