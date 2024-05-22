import {
  IndexableDocument,
  AbstractLLMService,
  IndexableDocChunk,
  Message,
  PluginNameDefinitions,
} from "@ocular/types";
import { OpenAI } from "openai";
import { encoding_for_model, type TiktokenModel } from "tiktoken";
import { RateLimiterService } from "@ocular/ocular";
import { RateLimiterQueue } from "rate-limiter-flexible";

export default class OpenAIService extends AbstractLLMService {
  static identifier = PluginNameDefinitions.OPENAI;

  protected openAIKey_: string;
  protected openAI_: OpenAI;
  protected embeddingModel_: string;
  protected chatModel_: string;
  protected tokenLimit_: number = 4096;
  protected rateLimiterService_: RateLimiterService;
  protected requestQueue_: RateLimiterQueue;

  constructor(container, options) {
    super(arguments[0], options);

    // Rate Limiter Service
    this.rateLimiterService_ = container.rateLimiterService;
    this.requestQueue_ = this.rateLimiterService_.getRequestQueue(
      PluginNameDefinitions.OPENAI
    );

    // Models
    this.embeddingModel_ = options.embedding_model;
    this.chatModel_ = options.chat_model;

    // Chat Deployment
    this.openAIKey_ = options.open_ai_key;
    this.openAI_ = new OpenAI({
      apiKey: this.openAIKey_ || "",
    });
  }

  async createEmbeddings(text: string): Promise<number[]> {
    try {
      // Rate Limiter Limits On Token Count
      const tokenCount = this.getChatModelTokenCount(text);
      await this.requestQueue_.removeTokens(
        tokenCount,
        PluginNameDefinitions.OPENAI
      );
      const result = await this.openAI_.embeddings.create({
        model: this.embeddingModel_,
        input: text,
      });
      return result.data[0].embedding;
    } catch (error) {
      console.log("Open AI: Error", error);
    }
  }

  async completeChat(messages: Message[]): Promise<string> {
    try {
      const result = await this.openAI_.chat.completions.create({
        model: this.chatModel_,
        messages,
        temperature: 0.3,
        max_tokens: 1024,
        n: 1,
      });
      console.log("Result Open AI", result.choices[0].message.content);
      return result.choices[0].message.content;
    } catch (error) {
      console.log("Open AI: Error", error);
    }
  }

  async *completeChatWithStreaming(
    messages: Message[]
  ): AsyncGenerator<string> {
    try {
      const result = await this.openAI_.chat.completions.create({
        model: this.chatModel_,
        stream: true,
        messages,
        temperature: 0.3,
        max_tokens: 1024,
        n: 1,
      });
      let content = "";
      for await (const chunk of result) {
        content += chunk.choices[0]?.delta.content ?? "";
        yield content;
      }
    } catch (error) {
      console.log("Azure Open AI: Error", error);
    }
  }

  getChatModelTokenCount(content: string): number {
    const encoder = encoding_for_model(this.chatModel_ as TiktokenModel);
    let tokens = 2;
    for (const value of Object.values(content)) {
      tokens += encoder.encode(value).length;
    }
    encoder.free();
    return tokens;
  }

  getTokenLimit(): number {
    return this.tokenLimit_;
  }
}
