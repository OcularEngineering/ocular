## 🚀 Integrate Ocular with Slack

### Features

- Fetch Slack Channels and Messages directly into Ocular.

### Installation Steps

1. Open the `ocular/core-config.js` file.
2. Add the following configuration snippet at the end of the `apps` array:

```js
const apps = [
  // Other configurations...
  {
    resolve: "slack",
    options: {
      client_id: process.env.SLACK_CLIENT_ID,
      client_secret: process.env.SLACK_CLIENT_SECRET,
      redirect_uri: `${UI_CORS}/dashboard/marketplace/jira`,
    },
  },
];
```
