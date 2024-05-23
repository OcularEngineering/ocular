import {
  IndexableDocChunk,
  Message,
  SearchResults,
  SearchResultChunk,
  ChatContext,
  ChatResponse,
} from "../common";
import { SearchContext } from "../common";

export enum ApproachDefinitions {
  ASK_RETRIEVE_READ = "ask-retrieve-read",
  CHAT_RETRIEVE_READ = "chat-retrieve-read",
}

export interface ISearchApproach {
  identifier: ApproachDefinitions;
  run(
    indexName: string,
    query: string,
    context?: SearchContext
  ): Promise<SearchResults>;
  runWithStreaming(
    query: string,
    context?: SearchContext
  ): AsyncGenerator<SearchResults, void>;
}

export interface IChatApproach {
  run(messages: Message[], context?: ChatContext): Promise<ChatResponse>;
  runWithStreaming(
    messages: Message[],
    context?: ChatContext
  ): AsyncGenerator<SearchResultChunk, void>;
}
