import { asValue } from "awilix";
import Redis from "ioredis";
import FakeRedis from "ioredis-mock";
import { EOL } from "os";
import { Logger, AutoflowContainer } from "@ocular/types";
import { ConfigModule } from "../types/config-module";
import { Kafka, logLevel } from "kafkajs";

type Options = {
  container: AutoflowContainer;
  configModule: ConfigModule;
  logger: Logger;
};

async function kafkaLoader({
  container,
  configModule,
  logger,
}: Options): Promise<void> {
  if (configModule.projectConfig.kafka_url) {
    try {
      const kafkaClient = new Kafka({
        clientId: "ocular",
        brokers: [configModule.projectConfig.kafka_url],
        logLevel: logLevel.ERROR,
      });
      await kafkaClient.admin().connect();
      logger?.info(`Connection to Kafka established`);
      container.register({
        kafkaClient: asValue(kafkaClient),
      });
    } catch (err) {
      throw new Error(
        `An error occurred while connecting to Kafka:${EOL} ${err}`
      );
    }
  } else {
    throw new Error(
      `No Kafka url was provided - using Ocular without a proper Kafka instance is allowed`
    );
  }
}

export default kafkaLoader;
