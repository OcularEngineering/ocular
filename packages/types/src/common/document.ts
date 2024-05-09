import e from "express";
import { AppNameDefinitions, AppCategoryDefinitions } from "../apps";
export const INDEX_DOCUMENT_EVENT = "INDEX_DOCUMENT_EVENT";

export interface Section {
  content: string;
  link: string;
}

export enum DocType {
  PDF = "pdf",
  TEXT = "text",
  DOCX = "docx",
  HTML = "html",
  MD = "md",
}

// Document containing infomation from external intergrations to be indexed in the search engine
export type IndexableDocument = {
  id: string;
  organisationId: string;
  source: AppNameDefinitions;
  title: string;
  type: DocType;
  sections?: Section[];
  metadata: Record<string, unknown>;
  updatedAt: Date;
};

// Document Chunk to be indexed in the search engine
export type IndexableDocChunk = {
  chunkId: number;
  organisationId: string;
  documentId: string;
  source: AppNameDefinitions;
  title: string;
  titleEmbeddings?: number[] | null;
  content?: string;
  contentEmbeddings?: number[] | null;
  tokens: number;
  chunkLinks?: Record<number, string>;
  metadata: Record<string, unknown>;
  updatedAt: Date;
};

// Document to be returned by the Search API to the client
export interface SearchDocument {
  documentId: string;
  documentMetadata?: DocumentMetadata;
  snippets: SearchSnippet[];
}

export interface SearchDocChunk {
  score: number;
  chunkId: number;
  content: string;
  documentId: string;
  metadata: Record<string, any>;
  organisationId: string;
  source: AppNameDefinitions;
  title: string;
  updatedAt: string;
}

export interface SearchSnippet {
  content: string;
}

export interface SearchChunk {
  score: number;
  chunkId: number;
  documentId: string;
  title: string;
  content: string;
  source: AppNameDefinitions;
}

export interface DocumentMetadata {
  id: string;
  link: string;
  title: string;
  type: DocType;
  source: AppNameDefinitions;
  organisation_id: string;
  created_at: Date;
  updated_at: Date;
}
