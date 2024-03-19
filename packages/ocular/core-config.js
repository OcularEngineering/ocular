const dotenv = require("dotenv");

let ENV_FILE_NAME = "";
switch (process.env.NODE_ENV) {
  case "production":
    ENV_FILE_NAME = ".env.production";
    break;
  case "staging":
    ENV_FILE_NAME = ".env.staging";
    break;
  case "test":
    ENV_FILE_NAME = ".env.test";
    break;
  case "development":
  default:
    ENV_FILE_NAME = ".env";
    break;
}

try {
  dotenv.config({ path: process.cwd() + "/" + ENV_FILE_NAME });
} catch (e) { }
 
// UI_CORS is the URL of the UI that is allowed to access the API
const UI_CORS = process.env.ADMIN_CORS || "http://localhost:3001";


/** @type {import('./src/types/config-module').ConfigModule} */
module.exports = {
  projectConfig: {
    jwtSecret: process.env.JWT_SECRET,
    cookieSecret: process.env.COOKIE_SECRET,
    database_url: process.env.DATABASE_URL,
    database_database: process.env.DATABASE_NAME,
    database_type: "postgres",
    redis_url: process.env.REDIS_URL,
    ui_cors: UI_CORS,
    search_engine_options: {
      apiKey: process.env.AZURE_SEARCH_API_KEY,
      endpoint: process.env.AZURE_SEARCH_ENDPOINT,
    },
    azure_open_ai_options: {
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      serviceName: process.env.AZURE_OPEN_AI_SERVICE_NAME,
      apiVersion: process.env.AZURE_OPENAI_API_VERSION,
      deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
      openAIModel: "gpt-4"
    },
  },
  apps: [
    {
      resolve: `asana`,
      options:{
        client_id: process.env.ASANA_CLIENT_ID,
        client_secret: process.env.ASANA_CLIENT_SECRET,
        scope: "openid email profile",
        redirect_uri: `${UI_CORS}/dashboard/marketplace/asana`
      }
    },
    {
      resolve: `github`,
      options: {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        redirect_uri: `${UI_CORS}/dashboard/marketplace/github`,
        app_id: process.env.GITHUB_APP_ID,
        private_key: process.env.GITHUB_PRIVATE_KEY_PATH,
        scope: "repo"
      }
    },
    {
      resolve: `google-drive`,
      options: {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${UI_CORS}/dashboard/marketplace/google-drive`,
      }
    },
    {
      resolve: `gmail`,
      options: {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${UI_CORS}/dashboard/marketplace/gmail`,
      }
    },
  ],
  plugins: [
    // Add Azure Search Index As A Plugin
      // Type Of Plugin: Search Index
      // Backend Cant Start Without A Search Index Plugin
    // Add Azure Vector Search As A Plugin
      // Type Of Plugin: Vector Search
      // -> Backend Cant Start Without A Vector Search Plugin
    // LLM Model 
      // Type Of Plugin: LLM Model
      // -> Backend Cant Start Without A LLM Model Plugin
    {
      resolve: `resend`,
      options: {
        api_key: "",
        from: "onboarding@useocular.com",
      }
    }
  ]
};