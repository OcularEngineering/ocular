import { Kafka, Consumer as KafkaConsumer } from "kafkajs";
import { TransactionBaseService } from "./transaction-base-service";
import {
  ConsumerContext,
  ConsumerDescriptor,
  Consumer,
} from "../queue-service";

export interface IQueueService {
  send<T>(
    topicName: string,
    data: T,
    options?: Record<string, unknown>
  ): Promise<void>;
  sendBatch<T>(
    topicName: string,
    data: T[],
    options?: Record<string, unknown>
  ): Promise<void>;
  subscribe<T>(
    topicName: string,
    consumer: Consumer,
    context: ConsumerContext
  ): Promise<void>;
  subscribeBatch<T>(
    topicName: string,
    consumer: Consumer,
    context: ConsumerContext
  ): Promise<void>;
}

export abstract class AbstractQueueService implements IQueueService {
  protected kafkaClient: Kafka;
  protected topicToConsumersMap_: Map<string | symbol, ConsumerDescriptor[]> =
    new Map();

  protected storeConsumers({
    topicName,
    consumerId,
    consumer,
  }: {
    topicName: string | symbol;
    consumerId: string;
    consumer: KafkaConsumer;
  }) {
    const newConsumerDescriptor = { consumer, id: consumerId };

    const existingConsumers = this.topicToConsumersMap_.get(topicName) ?? [];

    const consumerAlreadyExists = existingConsumers.find(
      (sub) => sub.id === consumerId
    );

    if (consumerAlreadyExists) {
      throw Error(`Subscriber with id ${consumerId} already exists`);
    }

    this.topicToConsumersMap_.set(topicName, [
      ...existingConsumers,
      newConsumerDescriptor,
    ]);
  }

  protected async clearConsumers() {
    this.topicToConsumersMap_.forEach(async (consumers, topicName) => {
      for (const { consumer } of consumers) {
        await consumer.disconnect();
      }
    });
    console.log("All consumers disconnected");
    this.topicToConsumersMap_.clear();
  }

  abstract send<T>(
    topicName: string,
    data: T,
    options?: Record<string, unknown>
  ): Promise<void>;

  abstract sendBatch<T>(
    topicName: string,
    data: T[],
    options?: Record<string, unknown>
  ): Promise<void>;

  abstract subscribe<T>(
    topicName: string,
    consumer: Consumer,
    context: ConsumerContext
  ): Promise<void>;

  abstract subscribeBatch<T>(
    topicName: string,
    consumer: Consumer,
    context: ConsumerContext
  ): Promise<void>;
}
