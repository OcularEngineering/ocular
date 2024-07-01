import getConfigFile from "../utils/get-config-file";
import { ConfigModule } from "../types/config-module";

const isProduction = ["production", "prod"].includes(
  process.env.NODE_ENV || ""
);

const errorHandler = isProduction
  ? (msg: string): never => {
      throw new Error(msg);
    }
  : console.log;

export default (rootDirectory: string): ConfigModule => {
  const config_file = process.env.CONFIG_FILE;
  if (!config_file) {
    throw new Error(
      `[core-config] ⚠️ CONFIG_FILE not found. Fallback to default config file.`
    );
  }

  const { configModule, error } = getConfigFile<ConfigModule>(
    rootDirectory,
    config_file
  );

  if (error) {
    console.log("Error Loading Config", error);
  }

  if (!configModule?.projectConfig?.redis_url) {
    console.log(
      `[core-config] ⚠️ redis_url not found. A fake redis instance will be used.`
    );
  }

  const jwt_secret =
    configModule?.projectConfig?.jwt_secret ?? process.env.JWT_SECRET;
  if (!jwt_secret) {
    errorHandler(
      `[core-config] ⚠️ jwt_secret not found.${
        isProduction
          ? ""
          : " fallback to either cookie_secret or default 'supersecret'."
      }`
    );
  }

  const cookie_secret =
    configModule?.projectConfig?.cookie_secret ?? process.env.COOKIE_SECRET;
  if (!cookie_secret) {
    errorHandler(
      `[core-config] ⚠️ cookie_secret not found.${
        isProduction
          ? ""
          : " fallback to either cookie_secret or default 'supersecret'."
      }`
    );
  }

  return {
    projectConfig: {
      jwt_secret: jwt_secret ?? "supersecret",
      cookie_secret: cookie_secret ?? "supersecret",
      ...configModule?.projectConfig,
    },
    // modules: configModule?.modules ?? {},
    apps: configModule?.apps ?? [],
    plugins: configModule?.plugins ?? [],
    bots: configModule?.bots ?? [],
  };
};
