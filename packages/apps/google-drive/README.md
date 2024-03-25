# GoogleDrive

Intergrate Ocular with GoogleDrive.


## Features

- Get Google Drive Files into Ocular.


## How to Install

1\. In `ocular/core-config.js` add the following at the end of the `apps` array:

  ```js
  const apps = [
    // ...
     {
      {
        resolve: `google-drive`,
        options: {
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: `${UI_CORS}/dashboard/marketplace/google-drive`,
        }
    },
    },
  ]
  ```