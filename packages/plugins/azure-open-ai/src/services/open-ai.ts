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

export default class AzureOpenAIService extends AbstractLLMService {
  static identifier = PluginNameDefinitions.AZUREOPENAI;

  protected openAIKey_: string;
  protected embeddingsClient_: OpenAI;
  protected chatClient_: OpenAI;
  protected azureOpenAiApiVersion_: string;
  protected endpoint_: string;
  protected embeddingDeploymentName_: string;
  protected chatDeploymentName_: string;
  protected embeddingModel_: string;
  protected chatModel_: string;
  protected tokenLimit_: number = 4096;
  protected rateLimiterService_: RateLimiterService;
  protected requestQueue_: RateLimiterQueue;
  protected count_: number;

  constructor(container, options) {
    super(arguments[0], options);

    // Rate Limiter Service
    this.rateLimiterService_ = container.rateLimiterService;
    this.requestQueue_ = this.rateLimiterService_.getRequestQueue(
      PluginNameDefinitions.AZUREOPENAI
    );

    (this.azureOpenAiApiVersion_ = options.open_ai_version),
      (this.endpoint_ = options.endpoint);

    // Deployment Names
    this.embeddingDeploymentName_ = options.embedding_deployment_name;
    this.chatDeploymentName_ = options.chat_deployment_name;

    // Models
    this.embeddingModel_ = options.embedding_model;
    this.chatModel_ = options.chat_model;

    this.openAIKey_ = options.open_ai_key;

    this.count_ = 0;

    const commonOptions = {
      apiKey: this.openAIKey_,
      defaultQuery: { "api-version": this.azureOpenAiApiVersion_ },
      defaultHeaders: { "api-key": this.openAIKey_ },
    };

    // Embedding Deployment
    this.embeddingsClient_ = new OpenAI({
      ...commonOptions,
      baseURL: `${this.endpoint_}/openai/deployments/${this.embeddingDeploymentName_}`,
    });

    // Chat Deployment
    this.chatClient_ = new OpenAI({
      ...commonOptions,
      baseURL: `${this.endpoint_}/openai/deployments/${this.chatDeploymentName_}`,
    });
  }

  async createEmbeddings(text: string): Promise<number[]> {
    try {
      // const tokenCount = this.getChatModelTokenCount(text);

      const remainingCount = await this.requestQueue_.removeTokens(
        1,
        PluginNameDefinitions.AZUREOPENAI
      );
      this.count_++;
      console.log(
        "Requests To Open AI",
        this.count_,
        "Request Time",
        new Date()
      );
      const result = await this.embeddingsClient_.embeddings.create({
        input: text,
        model: this.embeddingModel_,
      });

      return result.data[0].embedding;
    } catch (error) {
      console.log("Azure Open AI: Error", error);
    }
  }

  async completeChat(messages: Message[]): Promise<string> {
    try {
      const result = await this.chatClient_.chat.completions.create({
        model: this.chatModel_,
        messages,
        temperature: 0.3,
        max_tokens: 1024,
        n: 1,
      });
      console.log("Result", result.choices[0].message.content);
      return result.choices[0].message.content;
    } catch (error) {
      console.log("Azure Open AI: Error", error);
    }
  }

  async *completeChatWithStreaming(
    messages: Message[]
  ): AsyncGenerator<string, any, unknown> {
    try {
      const result = await this.chatClient_.chat.completions.create({
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
