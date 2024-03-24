import { AutoflowContainer, Message } from '../common';
import { IndexableDocument,IndexableDocChunk } from '../common/indexable-document';
import { TransactionBaseService } from './transaction-base-service';

export interface ILLMInterface extends TransactionBaseService {
  createEmbeddings(text:string): Promise<number[]> ;
  completeChat(messages: Message[]): Promise<string>;
}

/**
 * @parentIgnore activeManager_,atomicPhase_,shouldRetryTransaction_,withTransaction
 */
export abstract class AbstractLLMService
  extends TransactionBaseService
  implements ILLMInterface
{
  static _isLLM = true
  static identifier: string

  static isLLMService(object): boolean {
    return object?.constructor?._isLLM
  }

  getIdentifier(): string {
    return (this.constructor as any).identifier
  }

  protected constructor(
    protected readonly container: AutoflowContainer,
    protected readonly config?: Record<string, unknown> // eslint-disable-next-line @typescript-eslint/no-empty-function
  ) {
    super(container, config)
  }
  abstract createEmbeddings(text:string): Promise<number[]> ;
  abstract completeChat(messages: Message[]): Promise<string>;
}