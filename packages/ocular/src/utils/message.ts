// import { getTokenCountFromMessages } from './tokens.js';
import { Message, MessageRole } from '@ocular/types';

export class MessageBuilder {
  messages: Message[];
  tokens: number;
  model: string;

  /**
   * A class for building and managing messages in a chat conversation.
   * @param {string} systemContent The initial system message content.
   * @param {string} chatgptModel The name of the ChatGPT model.
   */
  constructor(systemContent: string, tokens:number) {
    this.messages = [{ role: 'system', content: systemContent }];
    this.tokens = tokens
  }

  /**
   * Append a new message to the conversation.
   * @param {MessageRole} role The role of the message sender.
   * @param {string} content The content of the message.
   * @param {number} index The index at which to insert the message.
   */
  appendMessage(role: MessageRole, content: string, index = 1, tokens:number) {
    this.messages.splice(index, 0, { role, content });
    this.tokens += tokens
  }

  static messageToString(message: Message): string {
    return `${message.role}: ${message.content}`;
  }
  
  static messagesToString(messages: Message[]): string {
    return messages.map((m) => this.messageToString(m)).join('\n\n');
  }
}

