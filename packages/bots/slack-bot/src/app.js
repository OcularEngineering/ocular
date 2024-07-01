import dotenv from 'dotenv';
import SlackBotService  from './services/slack-bot.js';

dotenv.config();


// Initializes your app with your bot token and signing secret

(async () => {
  try {
    console.log('Test Start models were synchronized successfully.');
    const app = new SlackBotService({},{
      slack_bot_token: process.env.SLACK_BOT_TOKEN,
      slack_app_token: process.env.SLACK_APP_TOKEN,
    });
  
    // eslint-disable-next-line no-console
    console.log('Test Connection has been established successfully.');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Unable to start App', error);
    process.exit(1);
  }
})();