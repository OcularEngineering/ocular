# 📝 Confluence Integration

Integrate Ocular with Confluence to enable fetching Confluence spaces and pages within Ocular.

## 🚀 Features

- Retrieve Confluence spaces and pages directly within Ocular.

## 🛠️ Installation Steps

1. Open `ocular/core-config.js` and add the following configuration at the end of the `apps` array:

```javascript
const apps = [
  // ...other configurations
  {
    resolve: "confluence",
    options: {
      client_id: process.env.CONFLUENCE_CLIENT_ID,
      client_secret: process.env.CONFLUENCE_CLIENT_SECRET,
      redirect_uri: `${UI_CORS}/dashboard/marketplace/confluence`,
    },
  },
];
```
