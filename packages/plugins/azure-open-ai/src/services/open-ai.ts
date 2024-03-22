import { IndexableDocument, AbstractLLMService, IndexableDocChunk } from "@ocular/types";
import { OpenAI } from 'openai';

const SENTENCE_ENDINGS = new Set(['.', '。', '．', '!', '?', '‼', '⁇', '⁈', '⁉']);
const WORD_BREAKS = new Set([',', '、', ';', ':', ' ', '(', ')', '[', ']', '{', '}', '\t', '\n']);
const MAX_SECTION_LENGTH = 1000;
const SENTENCE_SEARCH_LIMIT = 100;
const SECTION_OVERLAP = 100;

export default class OpenAIService extends AbstractLLMService {
  static identifier = "azure-open-ai"

  protected openAIKey_: string
  protected openai_: OpenAI
  protected azureOpenAiApiVersion_: string
  protected endpoint_: string
  protected embeddingDeploymentName_: string
  protected embeddingModel_: string

  constructor(container, options) {
    super(arguments[0],options)
    this.azureOpenAiApiVersion_ = options.open_ai_version,
    this.endpoint_= options.endpoint
    this.embeddingDeploymentName_ = options.embedding_deployment_name
    this.embeddingModel_ = options.model
    this.openAIKey_ = options.open_ai_key

    const commonOptions = {
      apiKey: this.openAIKey_,
      defaultQuery: { 'api-version': this.azureOpenAiApiVersion_ },
      defaultHeaders: { 'api-key': this.openAIKey_},
    };

    this.openai_ = new OpenAI({
      ...commonOptions,
      baseURL: `${this.endpoint_}/openai/deployments/${this.embeddingDeploymentName_}`,
    });
  }

  async createEmbeddings(text:string): Promise<number[]> {
    const result = await this.openai_.embeddings.create({ 
      input: text, 
      model: this.embeddingModel_,
    });
    return result.data[0].embedding;
  }
}