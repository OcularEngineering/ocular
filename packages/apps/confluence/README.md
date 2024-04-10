# Confluence

Intergrate Ocular with Confluence.

## Features

- Get Confluence spaces and pages into Ocular.

## How to Install

1\. In `ocular/core-config.js` add the following at the end of the `apps` array:

```js
const apps = [
  // ...
  {
    resolve: `confluence`,
    options: {
      client_id: process.env.CONFLUENCE_CLIENT_ID,
      client_secret: process.env.CONFLUENCE_CLIENT_SECRET,
      redirect_uri: `${UI_CORS}/dashboard/marketplace/confluence`,
    },
  },
];
```

---
