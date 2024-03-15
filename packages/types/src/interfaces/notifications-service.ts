import { AutoflowContainer } from "@ocular/utils"
import { TransactionBaseService } from "./transaction-base-service"

/**
 * @interface
 *
 * The details of a sent or resent notification.
 */
export type ReturnedData = {
  /**
   * The receiver of the Notification. For example, if you sent an email to the customer then `to` is the email address of the customer.
   * In other cases, it might be a phone number or a username.
   */
  to: string
  /**
   * The status of the sent notification. There are no restriction on the returned status.
   */
  status: string
  /**
   * The data used to send the Notification. For example, if you sent an order confirmation email to the customer, then the `data` object
   * might include the order items or the subject of the email. This `data` is necessary if the notification is resent later as you can use the same data.
   */
  data: Record<string, unknown>
}


/**
 * ## Overview
 *
 * :::note[Prerequisites]
 *
 * Before creating a Notification Provider, install an event bus module.
 *
 * :::
 *
 * A Notification Provider is a provider that handles sending and resending of notifications.
 *
 * To create a Notification Provider, create a TypeScript or JavaScript file in `src/services`. The name of the file is the name of the provider
 * (for example, `sendgrid.ts`). The file must export a class that extends the `AbstractNotificationService` class imported from.
 *
 * For example, create the file `src/services/email-sender.ts` with the following content:
 *
 * ```ts title="src/services/email-sender.ts"
 * import { AbstractNotificationService } from "@ocular-ai/types"
 * import { EntityManager } from "typeorm"
 *
 * class EmailSenderService extends AbstractNotificationService {
 *   protected manager_: EntityManager
 *   protected transactionManager_: EntityManager
 *
 *   sendNotification(
 *     event: string,
 *     data: unknown,
 *     attachmentGenerator: unknown
 *   ): Promise<{
 *       to: string;
 *       status: string;
 *       data: Record<string, unknown>;
 *     }> {
 *     throw new Error("Method not implemented.")
 *   }
 *   resendNotification(
 *     notification: unknown,
 *     config: unknown,
 *     attachmentGenerator: unknown
 *   ): Promise<{
 *       to: string;
 *       status: string;
 *       data: Record<string, unknown>;
 *     }> {
 *     throw new Error("Method not implemented.")
 *   }
 *
 * }
 *
 * export default EmailSenderService
 * ```
 *
 * ---
 *
 * ## Identifier Property
 *
 * The `NotificationProvider` entity has 2 properties: `identifier` and `is_installed`. The value of the `identifier` property in the notification provider
 * class is used when the Notification Provider is created in the database.
 *
 * The value of this property is also used later when you want to subscribe the Notification Provider to events in a subscriber.
 *
 * For example:
 *
 * ```ts
 * class EmailSenderService extends AbstractNotificationService {
 *   static identifier = "email-sender"
 *   // ...
 * }
 * ```
 *
 * ---
 */
export interface INotificationService extends TransactionBaseService {
  /**
   * When an event is triggered that your Notification Provider is registered as a handler for, the [`NotificationService`]
   *
   * In this method, you can perform the necessary operation to send the Notification. For example, you can send an email to the customer when they place an order.
   *
   * @param {string} event - The name of the event that was triggered. For example, `order.placed`.
   * @param {unknown} data - The data payload of the event that was triggered.
   * @param {unknown} attachmentGenerator - If you’ve previously register an attachment generator to the `NotificationService` using the
   * [`registerAttachmentGenerator`]. You have access to it here. You can use the `attachmentGenerator` to generate on-demand documents. The default value of this parameter is `null`.
   * @returns {Promise<ReturnedData>} The sending details.
   *
   * @example
   * class EmailSenderService extends AbstractNotificationService {
   *   // ...
   *   async sendNotification(
   *     event: string,
   *     data: any,
   *     attachmentGenerator: unknown
   *   ): Promise<{
   *       to: string;
   *       status: string;
   *       data: Record<string, unknown>;
   *     }> {
   *     if (event === "order.placed") {
   *       // retrieve order
   *       const order = await this.orderService.retrieve(data.id)
   *       // TODO send email
   *
   *       console.log("Notification sent")
   *       return {
   *         to: order.email,
   *         status: "done",
   *         data: {
   *           // any data necessary to send the email
   *           // for example:
   *           subject: "You placed a new order!",
   *           items: order.items,
   *         },
   *       }
   *     }
   *   }
   *   // ...
   * }
   */
  sendNotification(
    event: string,
    data: unknown,
    attachmentGenerator: unknown
  ): Promise<ReturnedData>

  /**
   * This method is used to resend notifications, which is typically triggered by the
   * [Resend Notification API Route]
   *
   * @param {unknown} notification - The original that was created after you sent the
   * notification with `sendNotification`. It includes the `to` and `data` attributes which are populated originally using the `to` and `data` properties of
   * the object you return in {@link sendNotification}.
   * @param {unknown} config - The new configuration used to resend the notification. If specified, it will be available in this config object.
   * @param {unknown} attachmentGenerator -
   * @returns {Promise<ReturnedData>} The resend details.
   *
   * @example
   * class EmailSenderService extends AbstractNotificationService {
   *   // ...
   *   async resendNotification(
   *     notification: any,
   *     config: any,
   *     attachmentGenerator: unknown
   *   ): Promise<{
   *       to: string;
   *       status: string;
   *       data: Record<string, unknown>;
   *     }> {
   *     // check if the receiver should be changed
   *     const to: string = config.to || notification.to
   *
   *     // TODO resend the notification using the same data
   *     // that is saved under notification.data
   *
   *     console.log("Notification resent")
   *     return {
   *       to,
   *       status: "done",
   *       data: notification.data, // make changes to the data
   *     }
   *   }
   * }
   */
  resendNotification(
    notification: unknown,
    config: unknown,
    attachmentGenerator: unknown
  ): Promise<ReturnedData>
}

/**
 * @parentIgnore activeManager_,atomicPhase_,shouldRetryTransaction_,withTransaction
 */
export abstract class AbstractNotificationService
  extends TransactionBaseService
  implements INotificationService
{
  /**
   * @ignore
   */
  static _isNotificationService = true
  static identifier: string

  /**
   * @ignore
   */
  static isNotificationService(object): boolean {
    return object?.constructor?._isNotificationService
  }

  /**
   * @ignore
   */
  getIdentifier(): string {
    return (this.constructor as any).identifier
  }

  /**
   * You can use the `constructor` of your notification provider to access the different services in Ocular through dependency injection.
   *
   * You can also use the constructor to initialize your integration with the third-party provider. For example, if you use a client to connect to the third-party provider’s APIs,
   * you can initialize it in the constructor and use it in other methods in the service.
   *
   * Additionally, if you’re creating your notification provider as an external plugin to be installed on any Ocular backend and you want to access the options
   * added for the plugin, you can access it in the constructor.
   *
   * // .
   *
   * class EmailSenderService extends AbstractNotificationService {
   *   // ...
   *   protected orderService: OrderService
   *
   *   constructor(container, options) {
   *     super(container)
   *     // you can access options here in case you're
   *     // using a plugin
   *
   *     this.orderService = container.orderService
   *
   *     // you can also initialize a client that
   *     // communicates with a third-party service.
   *     this.client = new Client(options)
   *   }
   *
   *   // ...
   * }
   *
   * export default EmailSenderService
   */
  protected constructor(
    protected readonly container: AutoflowContainer,
    protected readonly config?: Record<string, unknown> // eslint-disable-next-line @typescript-eslint/no-empty-function
  ) {
    super(container, config)
  }

  abstract sendNotification(
    event: string,
    data: unknown,
    attachmentGenerator: unknown
  ): Promise<ReturnedData>

  abstract resendNotification(
    notification: unknown,
    config: unknown,
    attachmentGenerator: unknown
  ): Promise<ReturnedData>
}