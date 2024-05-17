import {
  IndexableDocument,
  AbstractEmbedderService,
  IndexableDocChunk,
  Message,
  PluginNameDefinitions,
} from "@ocular/types";
import axios from "axios";

export default class OcularEmbeddingService extends AbstractEmbedderService {
  static identifier = "ocular-embedder";

  protected ocularModelsUrl_: string;

  constructor(container, options) {
    super(arguments[0], options);

    // Get URL OF THE OCULAR MODELS SERVER
    if (!options.models_server_url) {
      throw new Error("models_server_url not provided");
    }
    this.ocularModelsUrl_ = options.models_server_url;
  }

  async createEmbeddings(texts: string[]): Promise<number[]> {
    try {
      const embdeddings = await axios.post(`${this.ocularModelsUrl_}/embed`, {
        texts: texts,
      });
      return embdeddings.data;
    } catch (error) {
      console.log("Error Creating Embeddings", error.message);
    }
  }
}
