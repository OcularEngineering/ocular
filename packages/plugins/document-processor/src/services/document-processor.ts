import {
  IndexableDocument,
  IndexableDocChunk,
  AbstractDocumentProcesserService,
  Section,
  DocType,
} from "@ocular/types";
import { processTxt } from "../lib/txt";
export default class documentProcessorService extends AbstractDocumentProcesserService {
  static identifier = "document-processor";

  protected max_chunk_length_: number;
  protected sentence_search_limit_: number;
  protected chunk_over_lap_: number;

  constructor(container, options) {
    super(container, options);
    const { max_chunk_length, sentence_search_limit, chunk_over_lap } = options;
    this.max_chunk_length_ = max_chunk_length ? max_chunk_length : 1000;
    this.sentence_search_limit_ = sentence_search_limit
      ? sentence_search_limit
      : 100;
    this.chunk_over_lap_ = chunk_over_lap ? chunk_over_lap : 100;
  }

  async chunkIndexableDocument(
    document: IndexableDocument
  ): Promise<IndexableDocChunk[]> {
    let chunks: IndexableDocChunk[] = [];
    switch (document.type as DocType) {
      case DocType.PDF:
      case DocType.TXT:
        chunks = await processTxt(
          document,
          this.max_chunk_length_,
          this.chunk_over_lap_
        );
        break;
      default:
        console.log(
          "chunkIndexableDocument:Document Type Not Supported",
          document.type
        );
        return [];
    }
    return chunks;
  }

  async chunkIndexableDocumentsBatch(
    documents: IndexableDocument[]
  ): Promise<IndexableDocChunk[]> {
    let chunks: IndexableDocChunk[] = [];
    for (const document of documents) {
      chunks = await chunks.concat(await this.chunkIndexableDocument(document));
    }
    return chunks;
  }
}
