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

// CORS when consuming Medusa from admin
const ADMIN_CORS = process.env.ADMIN_CORS || "http://localhost:7001";

// CORS to avoid issues when consuming Medusa from a client
const STORE_CORS = process.env.STORE_CORS || "http://localhost:8000";

/** @type {import('./src/types/config-module').ConfigModule} */
module.exports = {
  projectConfig: {
    jwtSecret: process.env.JWT_SECRET,
    cookieSecret: process.env.COOKIE_SECRET,
    database_url: process.env.DATABASE_URL,
    database_database: process.env.DATABASE_NAME,
    database_type: "postgres",
    redis_url: process.env.REDIS_URL,
    store_cors: STORE_CORS,
    admin_cors: ADMIN_CORS,
    search_engine_options: {
      apiKey: process.env.AZURE_SEARCH_API_KEY,
      endpoint: process.env.AZURE_SEARCH_ENDPOINT,
      batchSize: 1,
      settings: {
        users: {
          indexSettings: {
            searchableAttributes: [
              "first_name",
              "last_name",
            ],
            attributesToRetrieve: [
              "objectID",
              "first_name",
              "last_name",
            ],
          },
          primaryKey: "id",
          transformer: (user) => ({
            objectID : user.id, 
            first_name: user.first_name,
            last_name: user.last_name,
            // other attributes...
          }),
        },
      },
    },
    vector_search_options: {
      apiKey: process.env.PINECONE_API_KEY,
    },
  },
  apps: [
    {
      resolve: `github`,
    }
  ]
};