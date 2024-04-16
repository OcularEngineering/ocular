import e from "express";
import { AppNameDefinitions, AppCategoryDefinitions } from "../apps";
export const INDEX_DOCUMENT_EVENT = "INDEX_DOCUMENT_EVENT"

export interface Section {
  offset: number
  content: string;
  link: string;
}

export enum DocType {
  PDF = 'pdf',
  TEXT = 'text',
  DOCX = 'docx',
  HTML = 'html',
  MD = 'md'
}

export type IndexableDocument = {
  id: string;
  organisationId: string;
  source: AppNameDefinitions;
  title: string;
  type: DocType
  sections?: Section[];
  metadata: Record<string, unknown>;
  updatedAt: Date;
};

export type IndexableDocChunk = {
  chunkId: number;
  organisationId: string;
  documentId: string;
  source: AppNameDefinitions;
  title: string;
  titleEmbeddings?: number[] | null;
  content?: string;
  contentEmbeddings?: number[] | null;
  metadata: Record<string, unknown>;
  updatedAt: Date;
  offsets: Record<number, string>;
};