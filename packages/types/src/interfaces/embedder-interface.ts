import { AutoflowContainer, Message } from "../common";
import { IndexableDocument, IndexableDocChunk } from "../common/document";
import { TransactionBaseService } from "./transaction-base-service";

export interface IEmbedderInterface extends TransactionBaseService {
  createEmbeddings(text: string[]): Promise<Array<number[]>>;
}

/**
 * @parentIgnore activeManager_,atomicPhase_,shouldRetryTransaction_,withTransaction
 */
export abstract class AbstractEmbedderService
  extends TransactionBaseService
  implements IEmbedderInterface
{
  static _isEmbeddingService = true;
  static identifier: string;

  static isEmbeddingService(object): boolean {
    return object?.constructor?._isEmbeddingService;
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
  abstract createEmbeddings(text: string[]): Promise<Array<number[]>>;
}
