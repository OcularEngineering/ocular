import { Kafka, Message, Producer,ProducerBatch, TopicMessages } from "kafkajs"
import { Consumer, ConsumerContext, TransactionBaseService, AbstractQueueService, Logger } from "@ocular/types"
import { ulid } from "ulid"
import { IndexableDocument } from "@ocular/types"

type InjectedDependencies = {
  logger: Logger
  kafkaClient: Kafka
}

export default class QueueService extends AbstractQueueService {
  protected logger_: Logger
  protected kafkaClient_: Kafka;
  protected producer_: Producer

  constructor({ logger, kafkaClient }: InjectedDependencies) {
    // @ts-ignore
    // eslint-disable-next-line prefer-rest-params
    super(...arguments)
    this.logger_ = logger
    try {
      this.kafkaClient_ = kafkaClient
      this.producer_ = kafkaClient.producer()
    } catch (error) {
      this.logger_.error(`Error creating Kafka producer: ${error.message}`)
    }

    process.on('exit', async () => {
      this.logger_.info("Disconnecting all consumers")
      await this.clearConsumers()
    });
  }
  
  // TODO: Implement Send Batch Documents to Queue Service
  async send<T>(
    topicName: string,
    data: T,
    options?: Record<string, unknown>
  ): Promise<void> {
    try{
      await this.producer_.connect()
      const record = await this.producer_.send({
        topic: topicName,
        messages: [{ value: JSON.stringify(data) }],
      })
      await this.producer_.disconnect()
    } catch (error) {
      this.logger_.error(`Error sending message to Kafka: ${error.message}`)
      throw error
    }
  }

  async sendBatch<T>(
    topicName: string,
    data: T[],
    options?: Record<string, unknown>
  ): Promise<void> {
    try {
      await this.producer_.connect()
      const messages = data.map((doc) => {
        return { value: JSON.stringify(doc) }
      })
      const topicMessages: TopicMessages = {
        topic: topicName,
        messages: messages
      }
      const batch: ProducerBatch = {
        topicMessages: [topicMessages]
      }
      await this.producer_.sendBatch(batch)
      await this.producer_.disconnect()
    } catch (error) {
      this.logger_.error(`Error sending batch message to Kafka: ${error.message}`)
      throw error
    }
  }

  async subscribe<T>(topicName: string, consumer: Consumer, context: ConsumerContext ): Promise<void> {
    // Check if the consumer is a function
    if (typeof consumer !== `function`) {
      throw new Error("Subscriber must be a function")
    }
    const kafkaConsumer = await this.kafkaClient_.consumer({ groupId: context.groupId })
    await kafkaConsumer.connect()
    await kafkaConsumer.subscribe({ topic: topicName, fromBeginning: true })
    kafkaConsumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const doc:IndexableDocument = JSON.parse(message.value.toString())
          await consumer(doc, topic)
        } catch (error) {
          this.logger_.error(`Error processing message: ${error.message}`)
        }
      },
    })
    
    const randId = ulid()
    const topic = topicName.toString()

    this.storeConsumers({ 
      topicName,
      consumerId: `${topic}-${randId}`,
      consumer: kafkaConsumer
    })
  }
}