import { IndexableDocChunk, Message, SearchResult, SearchResultChunk } from '../common';
import { SearchContext } from "../common";

export enum ApproachDefinitions {
  ASK_RETRIEVE_READ="ask-retrieve-read",
  CHAT_RETRIEVE_READ="chat-retrieve-read",
}
export interface IApproach {
  identifier: ApproachDefinitions;
  run(indexName: string, query: string, context?: SearchContext): Promise<SearchResult>;
  runWithStreaming(query: string, context?: SearchContext): AsyncGenerator<SearchResultChunk, void>;
}
