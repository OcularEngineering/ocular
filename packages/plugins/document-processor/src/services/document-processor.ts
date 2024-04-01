import { IndexableDocument, IndexableDocChunk, AbstractDocumentProcesserService, Section} from "@ocular/types";

const SENTENCE_ENDINGS = new Set(['.', '。', '．', '!', '?', '‼', '⁇', '⁈', '⁉']);
const WORD_BREAKS = new Set([',', '、', ';', ':', ' ', '(', ')', '[', ']', '{', '}', '\t', '\n']);
export default class documentProcessorService extends AbstractDocumentProcesserService {
  static identifier = "document-processor"
  
  protected max_chunk_length_ : number
  protected sentence_search_limit_: number
  protected chunk_over_lap_: number

  constructor(container, options) {
    super(container,options)
    const { max_chunk_length, sentence_search_limit, chunk_over_lap} = options
    this.max_chunk_length_  = max_chunk_length ? max_chunk_length : 1000;
    this.sentence_search_limit_ = sentence_search_limit? sentence_search_limit: 100;
    this.chunk_over_lap_ = chunk_over_lap? chunk_over_lap: 100;
  }

  // TODO: Use An Actual Tokenizer To Tokenize Chunks
  // Rigt Now This is Manual. Use LangChain Tooling.
  chunkIndexableDocument(document: IndexableDocument): IndexableDocChunk[] {
    
 
    const sections: Section[] = document.sections

    // Returns a dictionary of the offsets And links held a Chunk
    const findOffsetLinks = (start: number, end: number): Record<number,string>  => {
      const offsetLinks: Record<number, string> = {};
      const sectionCount = sections.length;
      
      sections.forEach(section => {
        if (section.offset >= start && section.offset <= end) {
          offsetLinks[section.offset] = section.link;
        }
      });
      return offsetLinks
    };
    
    const chunks: IndexableDocChunk[] = []
    const allText = sections.map((section) => section.content).join('');
    const allTextLength = allText.length

    let start = 0;
    let end = allTextLength;

    if (end <= this.max_chunk_length_) {
      return [{
          chunkId: chunks.length,
          organisationId: document.organisationId,
          documentId: document.id,
          source: document.source,
          title: document.title,
          content: allText,
          metadata: document.metadata,
          updatedAt: document.updatedAt,
          offsets: findOffsetLinks(start,end)
      }]
    }
    
    while (start + this.chunk_over_lap_ < allTextLength) {
      let lastWord = -1;
      end = start + this.max_chunk_length_;

      if (end > allTextLength) {
        end = allTextLength;
      } else {
        // Try to find the end of the sentence
        while (
          end < allTextLength &&
          end - start -  this.max_chunk_length_< this.sentence_search_limit_ &&
          !SENTENCE_ENDINGS.has(allText[end])
        ) {
          if (WORD_BREAKS.has(allText[end])) {
            lastWord = end;
          }
          end += 1;
        }
        if (end < allTextLength && !SENTENCE_ENDINGS.has(allText[end]) && lastWord > 0) {
          end = lastWord; // Fall back to at least keeping a whole word
        }
        if (end < allTextLength) {
          end += 1;
        }
      }

      // Try to find the start of the sentence or at least a whole word boundary
      lastWord = -1;
      while (
        start > 0 &&
        start > end - this.max_chunk_length_ - 2 * this.sentence_search_limit_&&
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

      const chunkText = allText.slice(start, end);


      chunks.push({
        chunkId: chunks.length,
        organisationId: document.organisationId,
        documentId: document.id,
        source: document.source,
        title: document.title,
        content: allText.slice(start, end),
        metadata: document.metadata,
        updatedAt: document.updatedAt,
        offsets: findOffsetLinks(start,end)
      });
      start = end - this.chunk_over_lap_;
    }

    if(start + this.chunk_over_lap_ < end){
      chunks.push({
        chunkId: chunks.length,
        organisationId: document.organisationId,
        documentId: document.id,
        source: document.source,
        title: document.title,
        content: allText.slice(start, end),
        metadata: document.metadata,
        updatedAt: document.updatedAt,
        offsets: findOffsetLinks(start,end)
      });
    }
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