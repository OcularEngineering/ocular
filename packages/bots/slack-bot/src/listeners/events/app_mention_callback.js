// const { reloadAppHome } = require('../../utilities');

const appMentionCallback = async ({ event, context, client, say }) => {
  try {
    console.log('appMentionCallback');

    await say({"blocks": [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `Thanks for the mention <@${event.user}>! Here's a button`
        },
        "accessory": {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Button",
            "emoji": true
          },
          "value": "click_me_123",
          "action_id": "first_button"
        }
      }
    ]});
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
};

module.exports = { appMentionCallback };