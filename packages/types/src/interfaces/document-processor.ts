import { AutoflowContainer } from '../common';
import { IndexableDocument,IndexableDocChunk } from '../common/document';
import { TransactionBaseService } from './transaction-base-service';

export interface IDocumentProcessorInterface extends TransactionBaseService {
  chunkIndexableDocument(document: IndexableDocument): IndexableDocChunk[];
  chunkIndexableDocumentsBatch(documents: IndexableDocument[]): IndexableDocChunk[];
}

/**
 * @parentIgnore activeManager_,atomicPhase_,shouldRetryTransaction_,withTransaction
 */
export abstract class AbstractDocumentProcesserService
  extends TransactionBaseService
  implements IDocumentProcessorInterface
{
  static _isDocumentProcessor= true
  static identifier: string

  static isDocumentProcessorService(object): boolean {
    return object?.constructor?._isDocumentProcessor
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

  abstract chunkIndexableDocument(document: IndexableDocument): IndexableDocChunk[]
  abstract chunkIndexableDocumentsBatch(documents: IndexableDocument[]): IndexableDocChunk[]
}