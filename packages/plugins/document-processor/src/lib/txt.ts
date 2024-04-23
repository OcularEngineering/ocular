import { IndexableDocChunk, IndexableDocument, Section } from "@ocular/types"
import e from "express"
import { encode } from "gpt-tokenizer"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"

export const processTxt = async (document: IndexableDocument, max_chunk_size: number, chunk_overlap: number): Promise<IndexableDocChunk[]> => {
  
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: max_chunk_size,
    chunkOverlap: chunk_overlap
  })

  const sections: Section[] = document.sections
  // If the document has no sections, return the document as a single chunk 
  if(!sections || sections.length === 0) {
    return [
      {
        chunkId: 0,
        organisationId: document.organisationId,
        documentId: document.id,
        source: document.source,
        title: document.title,
        tokens: encode(document.title).length,
        content: '',
        metadata: document.metadata,
        updatedAt: document.updatedAt,
      }
    ]
  }

  // Split the document into chunks
  let chunk_text = ''
  let chunks: IndexableDocChunk[] = []
  for (const section of sections) {
    // If the current section is bigger than the chunk size, split the section into chunks
    console.log("Before Splitting Section", section.content.length, max_chunk_size)
    if(encode(section.content).length > max_chunk_size) {
    // Create a new document for the remaining chunk_text
      console.log("Splitting Section", section.content.length)
      if(chunk_text.length > 0) {
        const tokens = encode(chunk_text).length
        const chunk = {
          chunkId: chunks.length,
          organisationId: document.organisationId,
          documentId: document.id,
          source: document.source,
          title: document.title,
          content: chunk_text,
          tokens: tokens,
          metadata: document.metadata,
          updatedAt: document.updatedAt,
        }
        chunks.push(chunk)
        chunk_text = ''
      }

      // Split the big section into chunks
      const splitDocs = await splitter.createDocuments([section.content])
      for (let i = 0; i < splitDocs.length; i++) {
        const doc = splitDocs[i]
        chunks.push(
          {
            chunkId: chunks.length,
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
      continue;
    }

    // If the current chunk_text + section.content is bigger than the chunk size, create a new chunk.
    if(chunk_text.length > 0 && chunk_text.length + section.content.length > max_chunk_size) {
      const tokens = encode(chunk_text).length
      const chunk = {
        chunkId: chunks.length,
        organisationId: document.organisationId,
        documentId: document.id,
        source: document.source,
        title: document.title,
        content: chunk_text,
        tokens: tokens,
        metadata: document.metadata,
        updatedAt: document.updatedAt,
      }
      chunks.push(chunk)
      chunk_text = section.content
    } else {
      chunk_text += section.content
    }
  }

  // Add the last chunk
  if(chunk_text.length > 0) {
    const tokens = encode(chunk_text).length
    const chunk = {
      chunkId: chunks.length,
      organisationId: document.organisationId,
      documentId: document.id,
      source: document.source,
      title: document.title,
      content: chunk_text,
      tokens: tokens,
      metadata: document.metadata,
      updatedAt: document.updatedAt,
    }
    chunks.push(chunk)
  }
  return chunks
}