const SENTENCE_ENDINGS = new Set(['.', '。', '．', '!', '?', '‼', '⁇', '⁈', '⁉']);
const WORD_BREAKS = new Set([',', '、', ';', ':', ' ', '(', ')', '[', ']', '{', '}', '\t', '\n']);
const MAX_SECTION_LENGTH = 1000;
const SENTENCE_SEARCH_LIMIT = 100;
const SECTION_OVERLAP = 100;

// Create Indexable Document From A Content File.
// Create an IndexableDocChunk From An IndexableDoc Content File.

// Create an IndexableDocument From A Content File.
async function createIndexableDocument(filename: string, contentSections: Section[], category: string): IndexableDocument {
  for (const [index, { content, page }] of contentSections.entries()) {
    const section: Section = {
      id: `${fileId}-page-${page}-section-${index}`,
      content,
      category: category,
      sourcepage: file,
      sourcefile: filename,
    };

    sections.push(section);
  }
  return sections;
}

// Chunk An IndexableDocument Into IndexableDocChunk.
function chunkIndexableDocument(document: IndexableDocument): IndexableDocChunk[] {
  this.logger.debug(`Splitting '${fileId}' into sections`);
  
  const allText = content.split('');
  const contentSections: Section[] = [];
  const length = content.length;
  let start = 0;
  let end = length;

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
      !SENTENCE_ENDINGS.has(content[start])
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

    const sectionText = content.slice(start, end);
    contentSections.push({ id:`${fileId}-section-${end}`, content: sectionText });
  }

  if (start + SECTION_OVERLAP < end) {
    contentSections.push({ id:`${fileId}-section-${end}` ,content:content.slice(start, end) });
  }

  return contentSections;
}