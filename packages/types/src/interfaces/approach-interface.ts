import { Message } from '../common';

export enum ApproachDefinitions {
  ASK_RETRIEVE_READ="ask-retrieve-read",
  CHAT_RETRIEVE_READ="chat-retrieve-read",
}


export interface ApproachResponse {
  choices: Array<{
    index: number;
    message: ApproachResponseMessage;
  }>;
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

export type ApproachContext = {
  retrieval_mode?: 'hybrid' | 'text' | 'vectors';
  semantic_ranker?: boolean;
  semantic_captions?: boolean;
  top?: number;
  temperature?: number;
  prompt_template?: string;
  prompt_template_prefix?: string;
  prompt_template_suffix?: string;
  exclude_category?: string;
};

export type ChatApproachContext = ApproachContext & {
  suggest_followup_questions?: boolean;
};

export interface IChatApproach {
  identifier: ApproachDefinitions;
  run(indexName: string, messages: Message[], context?: ChatApproachContext): Promise<ApproachResponse>;
}

export interface IAskApproach {
  identifier: ApproachDefinitions;
  run(indexName: string, query: string, context?: ApproachContext): Promise<ApproachResponse>;
}

