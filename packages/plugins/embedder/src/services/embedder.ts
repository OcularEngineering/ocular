import {
  IndexableDocument,
  AbstractEmbedderService,
  IndexableDocChunk,
  Message,
  PluginNameDefinitions,
  Logger,
} from "@ocular/types";
import axios from "axios";

export default class OcularEmbeddingService extends AbstractEmbedderService {
  static identifier = "embedder";

  protected ocularModelsUrl_: string;
  protected logger_: Logger;
  constructor(container, options) {
    super(arguments[0], options);

    // Get URL OF THE OCULAR MODELS SERVER
    if (!options.models_server_url) {
      throw new Error("models_server_url not provided");
    }
    this.ocularModelsUrl_ = options.models_server_url;
    this.logger_ = container.logger;
  }

  async createEmbeddings(texts: string[]): Promise<Array<number[]>> {
    try {
      // this.logger_.info(
      //   `createEmbeddings: Creating Embeddings for Texts ${texts.length}`
      // );
      const embdeddings = await axios.post(`${this.ocularModelsUrl_}/embed`, {
        texts: texts,
      });
      // this.logger_.info(`createEmbeddings: Done  embedding ${texts.length} `);
      return embdeddings.data;
    } catch (error) {
      this.logger_.error(
        `createEmbeddings: Error Creating Embeddings ${error.message}`
      );
    }
  }
}
