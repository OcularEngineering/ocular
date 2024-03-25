# Github

Intergrate Ocular with Github.


## Features

- Get GitHub Repos, Issues and Pull Requests into Ocular.


## How to Install

1\. In `ocular/core-config.js` add the following at the end of the `apps` array:

  ```js
  const apps = [
    // ...
     {
      resolve: `github`,
      options: {
        redirect_uri: `${UI_CORS}/dashboard/marketplace/github`,
        app_id: process.env.GITHUB_APP_ID,
        private_key: process.env.GITHUB_PRIVATE_KEY_PATH,
        scope: "repo"
      }
    },
  ]
  ```