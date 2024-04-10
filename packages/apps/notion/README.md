# 📝 Notion Integration

Integrate Ocular with Notion.

## ✨ Features

- Import Notion Pages into Ocular.

## 🚀 How to Install

1. Open `ocular/core-config.js` and append the following configuration to the `apps` array:

   ```js
   const apps = [
     // Existing configurations...
     {
       resolve: "notion",
       options: {
         client_id: process.env.NOTION_CLIENT_ID,
         client_secret: process.env.NOTION_CLIENT_SECRET,
         redirect_uri: `${UI_CORS}/dashboard/marketplace/notion`,
       },
     },
   ];
   ```
