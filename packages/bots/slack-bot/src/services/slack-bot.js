const { App, LogLevel } = require('@slack/bolt');
const {registerListeners} = require('../listeners/index.js');

const { BotNameDefinitions, AbstractBotService } = require("@ocular/types");

 class SlackBotService extends AbstractBotService {
  static identifier = BotNameDefinitions.SLACKBOT;

  constructor(container, options) {
    super(arguments[0], options);
    // BOT OPTIONS
    this.botToken_ = options.slack_bot_token;
    this.appToken_ = options.slack_app_token;
    console.log("SlackBotService constructor", this.botToken_, this.appToken_);

    // this.logger_ = container.resolve("logger");

    // Initializes your app with your bot token and signing secret
    const app = new App({
      token: process.env.SLACK_BOT_TOKEN,
      socketMode: true,
      appToken: process.env.SLACK_APP_TOKEN,
    });

    // Register all listeners
    // Expose Container To Listeners So That They Can Access Services And Make Queries To Ocular.
    registerListeners(app);

    (async () => {
      try {
        // this.logger_.info(
        //   "Slack Bot Connection has been established successfully."
        // );
        console.log("Slack Bot Connection has been established successfully.");
        // Start your app
        await app.start();

        console.log("Slack Bot is running!");
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log("Unable to start Slack Bot", error);
        process.exit(1);
      }
    })();
  }
}

module.exports = SlackBotService;