import { IndexableDocument } from '../common';
import { Writable } from 'stream';
import { AutoflowAiError} from "@ocular/utils"

export type BatchSearchEngineOptions = {
  batchSize: number;
};

/**
 * Base class encapsulating batch-based stream processing. Useful as a base
 * class for search engine indexers.
 */
export abstract class BatchSearchEngineIndexer extends Writable {
  private batchSize: number;
  private currentBatch: IndexableDocument[] = [];

  constructor(options: BatchSearchEngineOptions) {
    super({ objectMode: true });
    this.batchSize = options.batchSize;
  }

  /**
   * Receives an array of indexable documents (of size this.batchSize) which
   * should be written to the search engine. This method won't be called again
   * at least until it resolves.
   */
  public abstract index(documents: IndexableDocument[]): Promise<void>;

  public abstract initialize(): Promise<void>;

  public abstract finalize(): Promise<void>;

  async _construct(done: (error?: Error | null | undefined) => void) {
    try {
      await this.initialize();
      done();
    } catch (e) {
      throw new AutoflowAiError("Error initializing indexer", e);
      done(e);
    }
  }

  async _write(
    doc: IndexableDocument,
    _e: any,
    done: (error?: Error | null) => void,
  ) {
    this.currentBatch.push(doc);
    if (this.currentBatch.length < this.batchSize) {
      done();
      return;
    }

    try {
      await this.index(this.currentBatch);
      this.currentBatch = [];
      done();
    } catch (e) {
      throw new AutoflowAiError("Error writing to index", e);
      done(e);
    }
  }

  async _final(done: (error?: Error | null) => void) {
    try {
      // Index any remaining documents.
      if (this.currentBatch.length) {
        await this.index(this.currentBatch);
        this.currentBatch = [];
      }
      await this.finalize();
      done();
    } catch (e) {
      throw new AutoflowAiError("Error finalizing indexer", e);
      done(e);
    }
  }
}