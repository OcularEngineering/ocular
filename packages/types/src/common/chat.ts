import { IndexableDocChunk } from './document';
import { Message } from './message';

export type ChatContext = {
  stream?: boolean;
  suggest_followup_questions?: boolean;
};

export type ChatResponse = {
  message: Message;
  data_points?: IndexableDocChunk[]
  thoughts?: string;
};