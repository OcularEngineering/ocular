const { PluginNameDefinitions } = require("@ocular/types");
const dotenv = require("dotenv");

let ENV_FILE_NAME = "";
switch (process.env.NODE_ENV) {
  case "local":
    ENV_FILE_NAME = ".env.local";
    break;
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
    ENV_FILE_NAME = ".env.local";
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
      resolve: `webConnector`,
      options: {
        client_id: "FAKE_ID",
        client_secret: "FAKE_SECRET",
        redirect_uri: `${UI_CORS}/dashboard/marketplace/webConnector`,
      },
    },
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
      resolve: PluginNameDefinitions.OPENAI,
      options: {
        open_ai_key: process.env.OPEN_AI_KEY,
        chat_model: process.env.OPEN_AI_CHAT_MODEL,
        rate_limiter_opts: {
          requests: 1000000, // Number of Tokens
          interval: 60, // Interval in Seconds
        },
      },
    },
    {
      resolve: `qdrant-vector-search-service`,
      options: {
        quadrant_db_url: process.env.QDRANT_DB_URL || "http://localhost:6333",
        embedding_size: 768,
      },
    },
    {
      resolve: `embedder`,
      options: {
        models_server_url: process.env.OCULAR_MODELS_SERVER_URL,
      },
    },
  ],
};