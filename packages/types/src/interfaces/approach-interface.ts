import { IndexableDocChunk, Message } from '../common';
import { SearchContext } from "./search-interface";

export enum ApproachDefinitions {
  ASK_RETRIEVE_READ="ask-retrieve-read",
  CHAT_RETRIEVE_READ="chat-retrieve-read",
}


export interface ApproachResponse {
  choices: Array<{
    index: number;
    message: ApproachResponseMessage;
  }>;
  docs?: IndexableDocChunk[];
  object: 'chat.completion';
}

export interface ApproachResponseChunk {
  choices: Array<{
    index: number;
    delta: Partial<ApproachResponseMessage>;
    finish_reason: string | null;
  }>;
  object: 'chat.completion.chunk';
}


export type ApproachResponseMessage = Message & {
  context?: Record<string, any> & {
    data_points?: {
      text?: string[];
      images?: string[];
    };
    thoughts?: string;
  };
  session_state?: Record<string, any>;
};


export type ChatApproachContext = SearchContext & {
  suggest_followup_questions?: boolean;
};

export interface IChatApproach {
  identifier: ApproachDefinitions;
  run(indexName: string, messages: Message[], context?: ChatApproachContext): Promise<ApproachResponse>;
}

export interface IAskApproach {
  identifier: ApproachDefinitions;
  run(indexName: string, query: string, context?: SearchContext): Promise<ApproachResponse>;
}

