## 🚀 Integrate Ocular with BitBucket

### Features

- Fetch BitBucket Repositories, Pull Requests's and Issues directly into Ocular.

### Installation Steps

1. Open the `ocular/core-config.js` file.
2. Add the following configuration snippet at the end of the `apps` array:

```js
const apps = [
  // Other configurations...
  {
    resolve: "bitbucket",
    options: {
      client_id: process.env.BITBUCKET_CLIENT_ID,
      client_secret: process.env.BITBUCKET_CLIENT_SECRET,
      redirect_uri: `${UI_CORS}/dashboard/marketplace/bitbucket`,
    },
  },
];
```
