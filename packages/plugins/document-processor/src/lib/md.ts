import { IndexableDocChunk, IndexableDocument, Section } from "@ocular/types";
import e from "express";
import { encode } from "gpt-tokenizer";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export const processMarkdown = async (
  document: IndexableDocument,
  max_chunk_size: number,
  chunk_overlap: number
): Promise<IndexableDocChunk[]> => {
  const splitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
    chunkSize: max_chunk_size,
    chunkOverlap: chunk_overlap,
  });

  const title = document.title;
  const organisationId = document.organisationId;
  const documentId = document.id;
  const source = document.source;
  const metadata = document.metadata;
  const updatedAt = document.updatedAt;

  const sections: Section[] = document.sections;
  // If the document has no sections, return the document as a single chunk
  if (!sections || sections.length === 0) {
    return [
      {
        chunkId: 0,
        organisationId: organisationId,
        documentId: documentId,
        source: source,
        type: document.type,
        title: title,
        tokens: 0,
        content: "",
        metadata: metadata,
        updatedAt: updatedAt,
      },
    ];
  }

  // Split the document into chunks
  let chunk_text = "";
  let chunk_links = {};
  let chunks: IndexableDocChunk[] = [];
  for (const section of sections) {
    // If the current section is bigger than the chunk size, split the section into chunks
    if (encode(section.content).length > max_chunk_size) {
      // Create a new document for the remaining chunk_text
      if (chunk_text.length > 0) {
        const tokens = encode(chunk_text).length;
        const chunk = {
          chunkId: chunks.length,
          organisationId: organisationId,
          documentId: documentId,
          source: source,
          type: document.type,
          title: title,
          content: chunk_text,
          tokens: tokens,
          chunkLinks: chunk_links,
          metadata: metadata,
          updatedAt: updatedAt,
        };
        chunks.push(chunk);
        chunk_text = "";
        chunk_links = {};
      }

      // Split the big section into chunks
      const splitDocs = await splitter.createDocuments([section.content]);
      for (let i = 0; i < splitDocs.length; i++) {
        const doc = splitDocs[i];
        chunks.push({
          chunkId: chunks.length,
          organisationId: organisationId,
          documentId: documentId,
          source: source,
          type: document.type,
          title: title,
          content: doc.pageContent,
          tokens: encode(doc.pageContent).length,
          chunkLinks: { 0: section.link },
          metadata: metadata,
          updatedAt: updatedAt,
        });
      }
      continue;
    }

    // If the current chunk_text + section.content is bigger than the chunk size, create a new chunk.
    if (
      chunk_text.length > 0 &&
      chunk_text.length + section.content.length > max_chunk_size
    ) {
      const tokens = encode(chunk_text).length;
      const chunk = {
        chunkId: chunks.length,
        organisationId: document.organisationId,
        documentId: document.id,
        source: document.source,
        type: document.type,
        title: document.title,
        content: chunk_text,
        tokens: tokens,
        chunkLinks: chunk_links,
        metadata: document.metadata,
        updatedAt: document.updatedAt,
      };
      chunks.push(chunk);
      chunk_text = section.content;
      chunk_links = { 0: section.link };
    } else {
      chunk_text += section.content;
      let links_size = Object.keys(chunk_links).length;
      chunk_links[links_size] = section.link;
    }
  }

  // Add the last chunk
  if (chunk_text.length > 0) {
    const tokens = encode(chunk_text).length;
    const chunk = {
      chunkId: chunks.length,
      organisationId: document.organisationId,
      documentId: document.id,
      source: document.source,
      title: document.title,
      type: document.type,
      content: chunk_text,
      tokens: tokens,
      chunkLinks: chunk_links,
      metadata: document.metadata,
      updatedAt: document.updatedAt,
    };
    chunks.push(chunk);
  }
  return chunks;
};
