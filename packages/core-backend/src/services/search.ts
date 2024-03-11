import { IndexSettings } from "../types/search"
import {indexTypes}  from "../utils/search"
import Algolia, { SearchClient } from "algoliasearch"
import { AbstractSearchService } from "@ocular-ai/types"
import { AzureOpenAIOptions, SearchEngineOptions, SearchOptions } from "../types/search/options"
import { ConfigModule, Logger } from "../types"
import { RegisterOcularParameters } from "../types/ocular/ocular"
import OrganisationService from "./organisation"
import IndexerScript from "../scripts/indexer"
import { pipeline } from "stream"
import { SearchIndexClient } from "@azure/search-documents"
import JobSchedulerService from "./job-scheduler"
import { Organisation } from "../models"
import { OauthService } from "@ocular-ai/types/src/interfaces"
import axios from "axios"
import fs from "fs"



type InjectedDependencies = {
  organisationService: OrganisationService
  searchIndexClient: SearchIndexClient
  logger: Logger
}

class SearchService extends AbstractSearchService {
  isDefault = false

  protected readonly config_: ConfigModule
  protected readonly client_: SearchClient
  protected readonly organisationService_: OrganisationService
  protected readonly searchIndexClient_: SearchIndexClient
  protected readonly logger_: Logger
  protected readonly jobSchedulerService_: JobSchedulerService

  // Azure Open AI 
  protected readonly openAIOptions_: AzureOpenAIOptions

  private oculars: Record<string, RegisterOcularParameters>;
  constructor(container, config) {
    super(container, config)
    this.config_ = config
    this.oculars = {};

    // const { applicationId, adminApiKey, settings } = this.config_.projectConfig.search_engine_options as SearchEngineOptions

    // if (!applicationId) {
    //   throw new Error("Please provide a valid Application ID")
    // }

    // if (!adminApiKey) {
    //   throw new Error("Please provide a valid Admin Api Key")
    // }

    // this.client_ = Algolia(applicationId, adminApiKey)
    this.organisationService_ = container.organisationService
    this.searchIndexClient_ = container.searchIndexClient
    this.logger_ = container.logger
    this.jobSchedulerService_ = container.jobSchedulerService

    // Azure Open AI Keys
    this.openAIOptions_ = this.config_.projectConfig.azure_open_ai_options as AzureOpenAIOptions
  }

  /**
   * Makes the Search Engine Aware of an Ocular for Indexing Purposes.
   */
  addOcular(options: RegisterOcularParameters): void {
    const { factory, schedule } = options;
    console.log(
      `Added ${factory.constructor.name} ocular factory for type ${factory.type}`,
    );
    this.oculars[factory.type] = {
      factory,
      schedule,
    };
  }

  /**
   * Add two numbers.
   * @param {string} indexName - The name of the index
   * @param {*} options - not required just to match the schema we are used it
   * @return {*}
   */
  createIndex(indexName: string, options: Record<string, unknown> = {}) {
    return this.client_.initIndex(indexName)
  }

  /**
   * Used to get an index
   * @param {string} indexName  - the index name.
   * @return {Promise<{object}>} - returns response from search engine provider
   */
  async getIndex(indexName: string) {
    let hits: Record<string, unknown>[] = []

    return await this.client_
      .initIndex(indexName)
      .browseObjects({
        query: indexName,
        batch: (batch) => {
          hits = hits.concat(batch)
        },
      })
      .then(() => hits)
  }

  /**
   *
   * @param {string} indexName
   * @param {Array} documents - products list array
   * @param {*} type
   * @return {*}
   */
  async addDocuments(indexName: string, documents: any, type: string) {
    const transformedDocuments = await this.getTransformedDocuments(
      type,
      documents
    )
    try{
      await this.client_
        .initIndex(indexName)
        .saveObjects(transformedDocuments)
    }catch(e){
      console.log("e", e)
    }
  }

  /**
   * Used to replace documents
   * @param {string} indexName  - the index name.
   * @param {Object} documents  - array of document objects that will replace existing documents
   * @param {Array.<Object>} type  - type of documents to be replaced (e.g: products, regions, orders, etc)
   * @return {Promise<{object}>} - returns response from search engine provider
   */
  async replaceDocuments(indexName: string, documents: any, type: string) {
    const transformedDocuments = await this.getTransformedDocuments(
      type,
      documents
    )
    return await this.client_
      .initIndex(indexName)
      .replaceAllObjects(transformedDocuments)
  }

  /**
   * Used to delete document
   * @param {string} indexName  - the index name
   * @param {string} documentId  - the id of the document
   * @return {Promise<{object}>} - returns response from search engine provider
   */
  async deleteDocument(indexName: string, documentId: string) {
    return await this.client_.initIndex(indexName).deleteObject(documentId)
  }

  /**
   * Used to delete all documents
   * @param {string} indexName  - the index name
   * @return {Promise<{object}>} - returns response from search engine provider
   */
  async deleteAllDocuments(indexName: string) {
    return await this.client_.initIndex(indexName).delete()
  }

  /**
   * Used to search for a document in an index
   * @param {string} indexName - the index name
   * @param {string} query  - the search query
   * @param {*} options
   * - any options passed to the request object other than the query and indexName
   * - additionalOptions contain any provider specific options
   * @return {*} - returns response from search engine provider
   */
  async search(
    indexName: string,
    query: string,
    options: SearchOptions & Record<string, unknown>
  ) {
    console.log("Query", query)
  //   // Hybrid Vector Search
  // // 1. Cross Field Vector Search
  // // 2. Hybrid Vector Search -> Text + Vector Query
  // // 3. Vector Search with Filter (Filter With Source(Github, Gitlab, etc))
  // // 4. Semantic Search
  // // TODO: Abstract This Into A Query Service That Does Query Translation.
  let filter = ''
  if (options.hybridVectorSearch) {
    filter = `source eq ${options.categoryFilter}`
  }

  const searchClient = this.searchIndexClient_.getSearchClient(indexName);
  const searchResults = await searchClient.search(query, {
    // vectorSearchOptions: {
    //   queries: [
    //     {
    //       kind: 'vector',
    //       vector: await this.generateEmbeddings(query),
    //       fields: ["titleVector", "contentVector"],
    //       kNearestNeighborsCount: 5,
    //     }
    //   ],
    // },
    filter: filter,
    select: ["title","source","content","updated_at","location"],
    top: 3,
    // queryType: "semantic",
    // semanticSearchOptions: {
    //   answers: {
    //     answerType: "extractive",
    //     count: 3
    //   },
    //   captions:{
    //     captionType: "extractive",
    //   },
    //   configurationName: "my-semantic-config",
    // },
    });

    // for await (const answer of searchResults.answers) {
    //   if (answer.highlights) {
    //     console.log(`Semantic answer: ${answer.highlights}`);
    //   } else {
    //     console.log(`Semantic answer: ${answer.text}`);
    //   }
    //   console.log(`Semantic answer score: ${answer.score}\n`);
    // }

    // for await (const result of searchResults.results) {
    //   // console.log(`Title: ${result.document.title}`);
    //   // console.log(`Reranker Score: ${result.rerankerScore}`); // Reranker score is the semantic score
    //   // console.log(`Content: ${result.document.content}`);
    //   // console.log(`Category: ${result.document.category}`);
  
    //   if (result.captions) {
    //     const caption = result.captions[0];
    //     if (caption.highlights) {
    //       console.log(`Caption: ${caption.highlights}`);
    //     } else {
    //       console.log(`Caption: ${caption.text}`);
    //     }
    //   }
  
    //   console.log(`\n`);
    // }
    const resultsArray = [];
    for await (const result of searchResults.results) {
      resultsArray.push(result);
    }
    return resultsArray;
  
    // const inputData = JSON.parse(
    //   fs.readFileSync("/Users/louismurerwa/Desktop/LuxaInvestmentsProjects/autoflow-ai/packages/core-backend/src/data/mock-data.json", "utf-8")
    // );

    // return inputData;
  }

  async generateEmbeddings(text: string): Promise<number[]> {
   // Set Azure OpenAI API parameters from environment variables
    const apiBase = `https://${this.openAIOptions_.deploymentName}.openai.azure.com`;

    const response = await axios.post(
      `${apiBase}/openai/deployments/${this.openAIOptions_.deploymentName}/embeddings?api-version=${this.openAIOptions_.apiVersion}`,
      {
        input: text,
        engine: this.openAIOptions_.openAIModel,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": this.openAIOptions_.apiKey,
        },
      }
    );

    const embeddings = response.data.data[0].embedding;
    return embeddings;
  }

  /**
   * Used to update the settings of an index
   * @param  {string} indexName - the index name
   * @param {object} settings  - settings object
   * @return {Promise<{object}>} - returns response from search engine provider
   */
  async updateSettings(
    indexName: string,
    settings: IndexSettings & Record<string, unknown>
  ) {
    // backward compatibility
    const indexSettings = settings.indexSettings ?? settings ?? {}

    return await this.client_.initIndex(indexName).setSettings(indexSettings)
  }

  async getTransformedDocuments(type: string, documents: any[]) {
    if (!documents?.length) {
      return []
    }

    switch (type) {
      case indexTypes.PRODUCTS:
        const productsTransformer =
          this.config_.projectConfig.search_engine_options.settings?.[indexTypes.PRODUCTS]
            ?.transformer
        return documents.map(productsTransformer)
      case indexTypes.USERS:
        const usersTransformer =
          this.config_.projectConfig.search_engine_options.settings?.[indexTypes.USERS]
            ?.transformer
        return documents.map(usersTransformer)
      default:
        return documents
    }
  }
}
export default SearchService