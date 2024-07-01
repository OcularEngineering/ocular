import { TransactionBaseService } from "./transaction-base-service";
import { AutoflowContainer } from "../common";

export interface IBotServiceInterface extends TransactionBaseService {
  run(): Promise<void>;
}

/**
 * @parentIgnore activeManager_,atomicPhase_,shouldRetryTransaction_,withTransaction
 */
export abstract class AbstractBotService
  extends TransactionBaseService
  implements IBotServiceInterface
{
  static _isBotService = true;
  static identifier: string;

  static isBotService(object): boolean {
    return object?.constructor?._isBotService;
  }

  getIdentifier(): string {
    return (this.constructor as any).identifier;
  }

  protected constructor(
    protected readonly container: AutoflowContainer,
    protected readonly config?: Record<string, unknown> // eslint-disable-next-line @typescript-eslint/no-empty-function
  ) {
    super(container, config);
  }

  abstract run(): Promise<void>;
}
