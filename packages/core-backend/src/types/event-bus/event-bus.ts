import { Subscriber, SubscriberContext } from "."
import { TransactionBaseService } from "../../interfaces/transaction-base-service"

export interface IEventBusService extends TransactionBaseService {
  subscribe(
    eventName: string | symbol,
    subscriber: Subscriber,
    context?: SubscriberContext
  ): this

  unsubscribe(
    eventName: string | symbol,
    subscriber: Subscriber,
    context?: SubscriberContext
  ): this
  emit<T>(event: string, data: T, options?: unknown): Promise<unknown | void>
}