import {App} from '@slack/bolt'

import api from '../../../ocular-ui/services/api'

// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode:true, // socket mode for secured applications
  appToken: process.env.SLACK_BOT_APP_TOKEN,
  port: 3000
});

app.event('app_mention', async ({ event, client,logger }) => {
  try {
      let response;
      api.search.search(event.text)
      .then(data => {
        console.log(data.data)
        response = client.chat.postMessage({
          channel:event.channel,
          text:data.data
        })
      })
      .catch(err => {
        console.error(err);
      });
      logger.info(response)
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