const { PluginNameDefinitions } = require("@ocular/types");
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
    ENV_FILE_NAME = ".env.dev";
    break;
  default:
    ENV_FILE_NAME = ".env.dev";
    break;
}

try {
  dotenv.config({ path: process.cwd() + "/" + ENV_FILE_NAME });
} catch (e) {}

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
    kafka_url: process.env.KAFKA_URL,
    ui_cors: UI_CORS,
    azure_open_ai_options: {
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      serviceName: process.env.AZURE_OPEN_AI_SERVICE_NAME,
      apiVersion: process.env.AZURE_OPENAI_API_VERSION,
      deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
      openAIModel: "gpt-4",
    },
  },
  apps: [
    {
      resolve: `asana`,
      options: {
        client_id: process.env.ASANA_CLIENT_ID,
        client_secret: process.env.ASANA_CLIENT_SECRET,
        scope: "openid email profile",
        redirect_uri: `${UI_CORS}/dashboard/marketplace/asana`,
        rate_limiter_opts: {
          requests: 1500, // Number of Requests
          interval: 60, // Interval in Seconds
        },
      },
    },
    {
      resolve: `confluence`,
      options: {
        client_id: process.env.CONFLUENCE_CLIENT_ID,
        client_secret: process.env.CONFLUENCE_CLIENT_SECRET,
        redirect_uri: `${UI_CORS}/dashboard/marketplace/confluence`,
        rate_limiter_opts: {
          requests: 10, // Number of Requests
          interval: 1, // Interval in Seconds
        },
      },
    },
    {
      resolve: `jira`,
      options: {
        client_id: process.env.JIRA_CLIENT_ID,
        client_secret: process.env.JIRA_CLIENT_SECRET,
        redirect_uri: `${UI_CORS}/dashboard/marketplace/jira`,
        rate_limiter_opts: {
          requests: 10, // Number of Requests
          interval: 1, // Interval in Seconds
        },
      },
    },
    {
      resolve: `notion`,
      options: {
        client_id: process.env.NOTION_CLIENT_ID,
        client_secret: process.env.NOTION_CLIENT_SECRET,
        redirect_uri: `${UI_CORS}/dashboard/marketplace/notion`,
      },
      rate_limiter_opts: {
        requests: 3, // Number of Requests
        interval: 1, // Interval in Seconds
      },
    },
    {
      resolve: `slack`,
      options: {
        client_id: process.env.SLACK_CLIENT_ID,
        client_secret: process.env.SLACK_CLIENT_SECRET,
        redirect_uri: `${UI_CORS}/dashboard/marketplace/slack`,
        rate_limiter_opts: {
          requests: 60, // Number of Requests
          interval: 60, // Interval in Seconds
        },
      },
    },
    // {
    //   resolve: "bitbucket",
    //   options: {
    //     client_id: process.env.BITBUCKET_CLIENT_ID,
    //     client_secret: process.env.BITBUCKET_CLIENT_SECRET,
    //     redirect_uri: `${UI_CORS}/dashboard/marketplace/bitbucket`,
    //   },
    // },
    {
      resolve: `github`,
      options: {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        redirect_uri: `${UI_CORS}/dashboard/marketplace/github`,
        app_id: process.env.GITHUB_APP_ID,
        private_key: process.env.GITHUB_PRIVATE_KEY_PATH,
        scope: "repo",
      },
    },
    {
      resolve: `google-drive`,
      options: {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${UI_CORS}/dashboard/marketplace/google-drive`,
        rate_limiter_opts: {
          requests: 60, // Number of Requests
          interval: 60, // Interval in Seconds
        },
      },
    },
    {
      resolve: `gmail`,
      options: {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${UI_CORS}/dashboard/marketplace/gmail`,
        rate_limiter_opts: {
          requests: 60, // Number of Requests
          interval: 60, // Interval in Seconds
        },
      },
    },
    {
      resolve: `webConnector`,
      options: {
        client_id: "FAKE_ID",
        client_secret: "FAKE_SECRET",
        redirect_uri: `${UI_CORS}/dashboard/marketplace/webConnector`,
      },
    },
    // {
    //   resolve: `github`,
    //   options: {
    //     client_id: process.env.GITHUB_CLIENT_ID,
    //     client_secret: process.env.GITHUB_CLIENT_SECRET,
    //     redirect_uri: `${UI_CORS}/dashboard/marketplace/github`,
    //     app_id: process.env.GITHUB_APP_ID,
    //     private_key: process.env.GITHUB_PRIVATE_KEY_PATH,
    //     scope: "repo"
    //   }
    // },
  ],
  plugins: [
    {
      resolve: `document-processor`,
      options: {
        max_chunk_length: 500,
        sentence_search_limit: 100,
        chunk_over_lap: 0,
      },
    },
    {
      resolve: PluginNameDefinitions.AZUREOPENAI,
      options: {
        open_ai_key: process.env.AZURE_OPEN_AI_KEY,
        open_ai_version: "2023-05-15",
        endpoint: process.env.AZURE_OPEN_AI_ENDPOINT,
        embedding_deployment_name:
          process.env.AZURE_OPEN_AI_EMBEDDER_DEPLOYMENT_NAME,
        embedding_model: process.env.AZURE_OPEN_AI_EMBEDDING_MODEL,
        chat_deployment_name: process.env.AZURE_OPEN_AI_CHAT_DEPLOYMENT_NAME,
        chat_model: process.env.AZURE_OPEN_AI_CHAT_MODEL,
        rate_limiter_opts: {
          requests: 120000, // Number of Tokens
          interval: 60, // Interval in Seconds
        },
      },
    },
    // {
    //   resolve: PluginNameDefinitions.OPENAI,
    //   options: {
    //     open_ai_key: process.env.OPEN_AI_KEY,
    //     embedding_model: process.env.OPEN_AI_EMBEDDING_MODEL,
    //     chat_model: process.env.OPEN_AI_CHAT_MODEL,
    //     rate_limiter_opts: {
    //       requests: 1000000, // Number of Tokens
    //       interval: 60, // Interval in Seconds
    //     },
    //   },
    // },
    {
      resolve: `qdrant-vector-search-service`,
      options: {
        quadrant_db_url: process.env.QDRANT_DB_URL || "http://localhost:6333",
        embedding_size: 1536,
      },
    },
  ],
};
