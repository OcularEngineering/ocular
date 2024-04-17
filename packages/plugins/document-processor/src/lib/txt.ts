import { IndexableDocChunk, IndexableDocument } from "@ocular/types"
import { encode } from "gpt-tokenizer"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"

export const processTxt = async (document: IndexableDocument, chunk_size: number, chunk_overlap: number): Promise<IndexableDocChunk[]> => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: chunk_size,
    chunkOverlap: chunk_overlap
  })

  if(!document.sections.length) {
    return [
      {
        chunkId: 0,
        organisationId: document.organisationId,
        documentId: document.id,
        source: document.source,
        title: document.title,
        content: '',
        tokens: 0,
        metadata: document.metadata,
        updatedAt: document.updatedAt,
      }
    ]
  }

  const allText:string = document.sections.map((section) => section.content).join('');
  const splitDocs = await splitter.createDocuments([allText])
 
  let chunks: IndexableDocChunk[] = []

  for (let i = 0; i < splitDocs.length; i++) {
    const doc = splitDocs[i]
    chunks.push(
      {
        chunkId: i,
        organisationId: document.organisationId,
        documentId: document.id,
        source: document.source,
        title: document.title,
        content: doc.pageContent,
        tokens: encode(doc.pageContent).length,
        metadata: document.metadata,
        updatedAt: document.updatedAt,
      }
    )
  }

  return chunks
}