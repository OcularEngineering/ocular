import {App} from '@slack/bolt'

// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode:true, // socket mode for secured applications
  appToken: process.env.SLACK_BOT_APP_TOKEN,
  port: 3000
});

app.event('app_mention', async ({ event, context, client, say }) => {
    try {
      await say('Hello from Ocular');
      // call ocular co-pilot query and display the result
    }
    catch (error) {
      console.error(error);
    }
});
  
(async () => {
    // Start your app
    await app.start();
  
    console.log('⚡️ Bolt app is running!');
})();