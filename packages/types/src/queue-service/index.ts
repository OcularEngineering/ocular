import { Kafka, Consumer as KafkaConsumer } from "kafkajs"

export type Consumer<T = unknown> = (
  data: T,
  topicName: string
) => Promise<void>

export type ConsumerContext = {
  groupId: string
}

export type ConsumerDescriptor = {
  id: string
  consumer: KafkaConsumer
}