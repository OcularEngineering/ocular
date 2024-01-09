import { EmitData, EventBusModule, Subscriber, SubscriberContext, SubscriberDescriptor } from "../types/event-bus"
import { ulid } from "ulid"
import {TransactionBaseService} from "./transaction-base-service"

export abstract class AbstractEventBusModuleService implements EventBusModule
{
  protected eventToSubscribersMap_: Map<
    string | symbol,
    SubscriberDescriptor[]
  > = new Map()

  public get eventToSubscribersMap(): Map<
    string | symbol,
   SubscriberDescriptor[]
  > {
    return this.eventToSubscribersMap_
  }

  abstract emit<T>(
    eventName: string,
    data: T,
    options: Record<string, unknown>
  ): Promise<void>
  
  abstract emit<T>(data: EmitData<T>[]): Promise<void>

  protected storeSubscribers({
    event,
    subscriberId,
    subscriber,
  }: {
    event: string | symbol
    subscriberId: string
    subscriber: Subscriber
  }) {
    const newSubscriberDescriptor = { subscriber, id: subscriberId }

    const existingSubscribers = this.eventToSubscribersMap_.get(event) ?? []

    const subscriberAlreadyExists = existingSubscribers.find(
      (sub) => sub.id === subscriberId
    )

    if (subscriberAlreadyExists) {
      throw Error(`Subscriber with id ${subscriberId} already exists`)
    }

    this.eventToSubscribersMap_.set(event, [
      ...existingSubscribers,
      newSubscriberDescriptor,
    ])
  }

  public subscribe(
    eventName: string | symbol,
    subscriber: Subscriber,
    context?: SubscriberContext
  ): this {
    if (typeof subscriber !== `function`) {
      throw new Error("Subscriber must be a function")
    }
    /**
     * If context is provided, we use the subscriberId from it
     * otherwise we generate a random using a ulid
     */

    const randId = ulid()
    const event = eventName.toString()

    this.storeSubscribers({
      event,
      subscriberId: context?.subscriberId ?? `${event}-${randId}`,
      subscriber,
    })

    return this
  }

  unsubscribe(
    eventName: string | symbol,
    subscriber: Subscriber,
    context: SubscriberContext
  ): this {
    if (typeof subscriber !== `function`) {
      throw new Error("Subscriber must be a function")
    }

    const existingSubscribers = this.eventToSubscribersMap_.get(eventName)

    if (existingSubscribers?.length) {
      const subIndex = existingSubscribers?.findIndex(
        (sub) => sub.id === context?.subscriberId
      )

      if (subIndex !== -1) {
        this.eventToSubscribersMap_
          .get(eventName)
          ?.splice(subIndex as number, 1)
      }
    }

    return this
  }
}