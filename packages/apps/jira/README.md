# Jira

Intergrate Ocular with Jira.

## Features

- Get Jira Projects and Issues into Ocular.

## How to Install

1\. In `ocular/core-config.js` add the following at the end of the `apps` array:

```js
const apps = [
  // ...
  {
    resolve: `jira`,
    options: {
      client_id: process.env.JIRA_CLIENT_ID,
      client_secret: process.env.JIRA_CLIENT_SECRET,
      redirect_uri: `${UI_CORS}/dashboard/marketplace/jira`,
    },
  },
];
```

---
