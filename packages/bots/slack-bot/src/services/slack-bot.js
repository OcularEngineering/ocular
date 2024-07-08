import { App } from '@slack/bolt';
import registerListeners from '../listeners/index.js';
import { BotNameDefinitions, AbstractBotService } from '@ocular/types';

export default class SlackBotService extends AbstractBotService {
  static identifier = BotNameDefinitions.SLACKBOT;

  constructor(container, options) {
    super(arguments[0], options);
    // BOT OPTIONS
    this.botToken_ = options.slack_bot_token;
    this.appToken_ = options.slack_app_token;

    this.logger_ = container.logger

    // Initializes your app with your bot token and signing secret
    const app = new App({
      token: process.env.SLACK_BOT_TOKEN,
      socketMode: true,
      appToken: process.env.SLACK_APP_TOKEN,
    });

    registerListeners(app, container);

    (async () => {
      try {
        this.logger_.info(
          "Slack Bot Connection has been established successfully."
        );

        await app.start();

        this.logger_.info(
          "Slack Bot is running!."
        );
      } catch (error) {
        // eslint-disable-next-line no-console
        this.logger_.error("Unable to start Slack Bot", error);
        process.exit(1);
      }
    })();
  }
}