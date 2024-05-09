import { IndexableDocChunk, SearchDocument } from "@ocular/types";
/**
 * Convert IndexableChunks to SearchDocs and remove any null values and duplicates
 */

export function chunksToSearchDocs(
  chunks: IndexableDocChunk[]
): SearchDocument[] {
  const searchDocs: SearchDocument[] = [];
  const seenIds = new Set<string>();

  for (const chunk of chunks) {
    if (!chunk || seenIds.has(chunk.documentId)) {
      continue;
    }
    seenIds.add(chunk.documentId);
    searchDocs.push({
      // chunkId: chunk.chunkId,
      organisationId: chunk.organisationId,
      documentId: chunk.documentId,
      source: chunk.source,
      title: chunk.title,
      content: chunk.content,
      metadata: chunk.metadata,
      updatedAt: chunk.updatedAt,
    });
  }

  return searchDocs;
}
