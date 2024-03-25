# Asana

Intergrate Ocular with Asana.


## Features

- Get Asana Projects and Tasks into Ocular.


## How to Install

1\. In `ocular/core-config.js` add the following at the end of the `appss` array:

  ```js
  const apps = [
    // ...
    {
      resolve: `asana`,
      options:{
        client_id: process.env.ASANA_CLIENT_ID,
        client_secret: process.env.ASANA_CLIENT_SECRET,
        scope: "openid email profile",
        redirect_uri: `${UI_CORS}/dashboard/marketplace/asana`
      }
    },
  ]
  ```

---