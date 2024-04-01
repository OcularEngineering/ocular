import { IndexableDocChunk } from "./document";

export type MessageRole = 'system' | 'user' | 'assistant';

export interface Message {
  role: MessageRole;
  content: string;
}

export type SearchContext = {
  retrieval_mode?: 'hybrid' | 'text' | 'vectors';
  semantic_ranker?: boolean;
  semantic_captions?: boolean;
  top?: number;
  temperature?: number;
  prompt_template?: string;
  prompt_template_prefix?: string;
  prompt_template_suffix?: string;
  exclude_category?: string;
  suggest_followup_questions?: boolean;
};

export interface SearchResult {
  choices?: Array<{
    index: number;
    message: SearchResultMessage;
  }>;
  hits: IndexableDocChunk[]
  object: 'chat.completion';
}

export interface SearchResultChunk {
  choices: Array<{
    index: number;
    delta: Partial<SearchResultMessage>;
    finish_reason: string | null;
  }>;
  object: 'chat.completion.chunk';
}

export type  SearchResultMessage = Message & {
  context?: Record<string, any> & {
    data_points?: IndexableDocChunk[]
    thoughts?: string;
  };
  session_state?: Record<string, any>;
};
