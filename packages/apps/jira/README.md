## 🚀 Integrate Ocular with Jira

### Features

- Fetch Jira Projects and Issues directly into Ocular.

### Installation Steps

1. Open the `ocular/core-config.js` file.
2. Add the following configuration snippet at the end of the `apps` array:

```js
const apps = [
  // Other configurations...
  {
    resolve: "jira",
    options: {
      client_id: process.env.JIRA_CLIENT_ID,
      client_secret: process.env.JIRA_CLIENT_SECRET,
      redirect_uri: `${UI_CORS}/dashboard/marketplace/jira`,
    },
  },
];
```
