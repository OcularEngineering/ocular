import { IndexableDocChunk, SearchChunk } from './document';
import { Message } from './message';

export type ChatContext = {
  stream?: boolean;
  suggest_followup_questions?: boolean;
};


export type ChatResponse ={
  choices: Array<{
    index: number;
    message: ApproachResponseMessage;
  }>;
}

export type ChatResponseChunk ={
  choices: Array<{
    index: number;
    delta: Partial<ApproachResponseMessage>;
  }>;
  metadata?:Record<string,unknown>
}

export type ApproachResponseMessage = Message & {
  context?: Record<string, any> & {
    data_points?: {
      text?: SearchChunk[];
    };
    thoughts?: string;
  };
};