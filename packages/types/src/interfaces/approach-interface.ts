import { IndexableDocChunk, Message, SearchResult } from '../common';
import { SearchContext } from "../common";

export enum ApproachDefinitions {
  ASK_RETRIEVE_READ="ask-retrieve-read",
  CHAT_RETRIEVE_READ="chat-retrieve-read",
}
export interface IChatApproach {
  identifier: ApproachDefinitions;
  run(indexName: string, messages: Message[], context?: SearchContext): Promise<SearchResult>;
}

export interface IAskApproach {
  identifier: ApproachDefinitions;
  run(indexName: string, query: string, context?: SearchContext): Promise<SearchResult>;
}
