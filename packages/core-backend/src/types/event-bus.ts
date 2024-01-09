import { Job, JobsOptions, QueueOptions, WorkerOptions } from "bullmq"
import { RedisOptions } from "ioredis"

export type JobData<T> = {
  eventName: string
  data: T
  completedSubscriberIds?: string[] | undefined
}

export type BullJob<T> = {
  data: JobData<T>
} & Job

export type EmitOptions = JobsOptions

export type EventBusRedisModuleOptions = {
  queueName?: string
  queueOptions?: QueueOptions

  workerOptions?: WorkerOptions

  redisUrl?: string
  redisOptions?: RedisOptions

  /**
   * Global options passed to all `EventBusService.emit` in the core as well as your own emitters. The options are forwarded to Bull's `Queue.add` method.
   *
   * The global options can be overridden by passing options to `EventBusService.emit` directly.
   *
   * Example
   * ```js
   * {
   *    removeOnComplete: { age: 10 },
   * }
   * ```
   *
   * @see https://api.docs.bullmq.io/interfaces/BaseJobOptions.html
   */
  jobOptions?: EmitOptions
}

export type Subscriber<T = unknown> = (
  data: T,
  eventName: string
) => Promise<void>

export type SubscriberContext = {
  subscriberId: string
}

export type SubscriberDescriptor = {
  id: string
  subscriber: Subscriber
}

export type EventHandler<T = unknown> = (
  data: T,
  eventName: string
) => Promise<void>

export type EmitData<T = unknown> = {
  eventName: string
  data: T
  options?: Record<string, unknown>
}
