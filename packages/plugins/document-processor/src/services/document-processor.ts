import { IndexableDocument, IndexableDocChunk, AbstractDocumentProcesserService} from "@ocular/types";

const SENTENCE_ENDINGS = new Set(['.', '。', '．', '!', '?', '‼', '⁇', '⁈', '⁉']);
const WORD_BREAKS = new Set([',', '、', ';', ':', ' ', '(', ')', '[', ']', '{', '}', '\t', '\n']);
const MAX_SECTION_LENGTH = 1000;
const SENTENCE_SEARCH_LIMIT = 100;
const SECTION_OVERLAP = 100;

export default class DocumentProcessorService extends AbstractDocumentProcesserService {
  static identifier = "document-processor"


  chunkIndexableDocument(document: IndexableDocument): IndexableDocChunk[] {
    const allText = document?.content;
    const length = allText.length;
    const chunks: IndexableDocChunk[] = [];
    
    let start = 0;
    let end = length;
    let count = 0;
    while (start + SECTION_OVERLAP < length) {
      let lastWord = -1;
      end = start + MAX_SECTION_LENGTH;

      if (end > length) {
        end = length;
      } else {
        // Try to find the end of the sentence
        while (
          end < length &&
          end - start - MAX_SECTION_LENGTH < SENTENCE_SEARCH_LIMIT &&
          !SENTENCE_ENDINGS.has(allText[end])
        ) {
          if (WORD_BREAKS.has(allText[end])) {
            lastWord = end;
          }
          end += 1;
        }
        if (end < length && !SENTENCE_ENDINGS.has(allText[end]) && lastWord > 0) {
          end = lastWord; // Fall back to at least keeping a whole word
        }
        if (end < length) {
          end += 1;
        }
      }

      // Try to find the start of the sentence or at least a whole word boundary
      lastWord = -1;
      while (
        start > 0 &&
        start > end - MAX_SECTION_LENGTH - 2 * SENTENCE_SEARCH_LIMIT &&
        !SENTENCE_ENDINGS.has(allText[start])
      ) {
        if (WORD_BREAKS.has(allText[start])) {
          lastWord = start;
        }
        start -= 1;
      }
      if (!SENTENCE_ENDINGS.has(allText[start]) && lastWord > 0) {
        start = lastWord;
      }
      if (start > 0) {
        start += 1;
      }

      const sectionText = document.content.slice(start, end);
      chunks.push({
        id: `source-${document.id}-section-${end}`,
        organisationId: document.organisationId,
        sourceDocId: document.id,
        title: document.title,
        source: document.source,
        content: sectionText,
        metadata: document.metadata,
        updatedAt: document.updatedAt,
        location: document.location,
      });
      start = end - SECTION_OVERLAP;
    }

    chunks.push({
      id: `source-${document.id}-section-${end}`,
      organisationId: document.organisationId,
      sourceDocId: document.id,
      title: document.title,
      source: document.source,
      content: document.content.slice(start, end),
      metadata: document.metadata,
      updatedAt: document.updatedAt,
      location: document.location,
    });
    
    return chunks;
  }

  chunkIndexableDocumentsBatch(documents: IndexableDocument[]): IndexableDocChunk[] {
    let chunks: IndexableDocChunk[] = [];
    for (const document of documents) {
      chunks = chunks.concat(this.chunkIndexableDocument(document));
    }
    return chunks;
  }
}