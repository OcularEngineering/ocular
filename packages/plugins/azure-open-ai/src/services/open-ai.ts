import { IndexableDocument, AbstractLLMService, IndexableDocChunk, Message  } from "@ocular/types";
import { OpenAI } from 'openai';

const SENTENCE_ENDINGS = new Set(['.', '。', '．', '!', '?', '‼', '⁇', '⁈', '⁉']);
const WORD_BREAKS = new Set([',', '、', ';', ':', ' ', '(', ')', '[', ']', '{', '}', '\t', '\n']);
const MAX_SECTION_LENGTH = 1000;
const SENTENCE_SEARCH_LIMIT = 100;
const SECTION_OVERLAP = 100;

export default class OpenAIService extends AbstractLLMService {

  // MODEL_TOKEN_LIMITS: Record<string, number> = {
  //   'gpt-35-turbo': 4000,
  //   'gpt-3.5-turbo': 4000,
  //   'gpt-35-turbo-16k': 16_000,
  //   'gpt-3.5-turbo-16k': 16_000,
  //   'gpt-4': 8100,
  //   'gpt-4-32k': 32_000,
  // };
  
  // AZURE_OPENAI_TO_TIKTOKEN_MODELS: Record<string, string> = {
  //   'gpt-35-turbo': 'gpt-3.5-turbo',
  //   'gpt-35-turbo-16k': 'gpt-35-turbo-16k',
  // };


  static identifier = "azure-open-ai"

  protected openAIKey_: string
  protected embeddingsClient_: OpenAI
  protected chatClient_: OpenAI
  protected azureOpenAiApiVersion_: string
  protected endpoint_: string
  protected embeddingDeploymentName_: string
  protected chatDeploymentName_: string
  protected embeddingModel_: string
  protected chatModel_: string

  constructor(container, options) {
    super(arguments[0],options)

    this.azureOpenAiApiVersion_ = options.open_ai_version,
    this.endpoint_= options.endpoint

    // Deployment Names
    this.embeddingDeploymentName_ = options.embedding_deployment_name
    this.chatDeploymentName_ = options.chat_deployment_name

    // Models
    this.embeddingModel_ = options.embedding_model
    this.chatModel_ = options.chat_model

    this.openAIKey_ = options.open_ai_key

    const commonOptions = {
      apiKey: this.openAIKey_,
      defaultQuery: { 'api-version': this.azureOpenAiApiVersion_ },
      defaultHeaders: { 'api-key': this.openAIKey_},
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

  async createEmbeddings(text:string): Promise<number[]> {
    const result = await this.embeddingsClient_.embeddings.create({ 
      input: text, 
      model: this.embeddingModel_,
    });
    return result.data[0].embedding;
  }

  async completeChat(messages: Message[]): Promise<string> {
    console.log("Model",this.chatModel_)
    console.log("Deploynment",this.chatDeploymentName_)
    console.log("Messages",messages)
    const result = await this.chatClient_.chat.completions.create({
      model: this.chatModel_,
      messages,
      temperature:  0.3,
      max_tokens: 1024,
      n: 1,
    });
    console.log("Result",result.choices[0].message.content)
    return result.choices[0].message.content;
  }
}