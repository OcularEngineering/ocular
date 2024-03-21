import { IndexableDocument, AutoflowContainer,IIndexerInterface,  IDocumentProcessorInterface ,IndexFields, semanticSearchProfile ,vectorSearchProfile  } from "@ocular/types"
import { SearchIndexClient, SearchIndex} from "@azure/search-documents";
import { ConfigModule } from "../types/config-module"
import { Logger } from "@ocular/types";

export default class IndexerService implements IIndexerInterface {
  private config_: ConfigModule
  protected readonly searchIndexClient_: SearchIndexClient
  protected readonly logger_: Logger
  protected readonly documentProcessorService_:  IDocumentProcessorInterface

  constructor(container, config: ConfigModule) {
    this.config_ = config
    this.logger_ = container.logger
    this.searchIndexClient_ = container.searchIndexClient
    this.documentProcessorService_ = container.documentProcessorService
   

    // // const { applicationId, adminApiKey, settings } = this.config_.projectConfig.search_engine_options as SearchEngineOptions

    // // if (!applicationId) {
    // //   throw new Error("Please provide a valid Application ID")
    // // }

    // // if (!adminApiKey) {
    // //   throw new Error("Please provide a valid Admin Api Key")
    // // }

    // // this.client_ = Algolia(applicationId, adminApiKey)
    // this.organisationService_ = container.organisationService
    // this.searchIndexClient_ = container.searchIndexClient
    // this.logger_ = container.logger
    // this.jobSchedulerService_ = container.jobSchedulerService

    // // Azure Open AI Keys
    // this.openAIOptions_ = this.config_.projectConfig.azure_open_ai_options as AzureOpenAIOptions
  }

  async createIndex(indexName: string, options?: unknown){
    this.logger_.info(`Creating index ${indexName}`)

    // Store Existing Indexes In Memory To Avoid Unnecessary Calls To The Azure API
    const names: string[] = [];
    const indexNames = await this.searchIndexClient_.listIndexes();
    for await (const index of indexNames) {
      names.push(index.name);
    }

    // Check if Index exists in the Search Service
    if (!names.includes(indexName)) {
      this.logger_.info(` Create Search "${indexName}" Index`);
      const searchIndex: SearchIndex = {
        name: indexName,
        fields: IndexFields,
        vectorSearch: vectorSearchProfile,
        semanticSearch:semanticSearchProfile,
      }
      await this.searchIndexClient_.createIndex(searchIndex, options);
    }
  }

  indexDocuments(indexName: string, documents: IndexableDocument[]) {
    // Add Indexable Document to the Content Storage
    // Optionally Add Indexable Document to a Blob Storage.

    // Batch Chunk Indexable Documents
    const chunks = this.documentProcessorService_.chunkIndexableDocumentsBatch(documents)
    
    // Embed Documents Using an Embedder

    // Index Document Chunks into A Vector Database
    // chunkIndexableDocument

    // Index Document Chunks To The Azure Vector + DB Search Index
    this.logger_.info(`Indexing ${documents.length} documents to index ${indexName}`)
    try {
      const searchClient = this.searchIndexClient_.getSearchClient(indexName)
      searchClient.uploadDocuments(documents)
    } catch (error) {
      this.logger_.error(error)
      throw error
    }
  }
}
