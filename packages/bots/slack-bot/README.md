# Asana

Intergrate Ocular with a Slack Bot.


## Features

- Answer Slack Channel Questions With Ocular!


## How to Install

1\. In `ocular/core-config.js` add the following at the end of the `apps` array:

  ```js
  const apps = [
    // ...
    {
      resolve: `slack-bot`,
      options: {
        slack_bot_token: process.env.SLACK_BOT_TOKEN,
        slack_app_token: process.env.SLACK_APP_TOKEN,
      },
    },
  ]
  ```

---