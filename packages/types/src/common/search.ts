import { AppNameDefinitions } from "../apps";
import {
  DocType,
  IndexableDocChunk,
  SearchChunk,
  SearchDocument,
} from "./document";
import { Message } from "./message";

// export type SearchContext = {
//   retrieval_mode?: 'hybrid' | 'text' | 'vectors';
//   semantic_ranker?: boolean;
//   semantic_captions?: boolean;
//   top?: number;
//   temperature?: number;
//   prompt_template?: string;
//   prompt_template_prefix?: string;
//   prompt_template_suffix?: string;
//   exclude_category?: string;
//   suggest_followup_questions?: boolean;
// };

export type SearchContext = {
  ai_completion?: boolean;
  prompt_template?: string;
  suggest_followup_questions?: boolean;
  sources?: AppNameDefinitions[];
  top?: number;
  organisation_id?: string;
  retrieve_chunks?: boolean;
  types?: DocType[];
  date?: {
    from?: string;
    to?: string;
  };
};

// Vector Filter
// Top/Limit (Amount of Search Results to Return)
// Sources: Set<sources> -> example <"gmail", "drive">
//
//

export interface SearchResults {
  chat_completion?: {
    content?: string;
    citations?: SearchChunk[];
  };
  hits?: SearchDocument[];
  sources?: AppNameDefinitions[];
}

export interface SearchResultChunk {
  choices: Array<{
    index: number;
    delta: Partial<SearchResultMessage>;
    finish_reason: string | null;
  }>;
  object: "chat.completion.chunk";
}

export type SearchResultMessage = Message & {
  context?: Record<string, any> & {
    data_points?: IndexableDocChunk[];
    thoughts?: string;
  };
};
