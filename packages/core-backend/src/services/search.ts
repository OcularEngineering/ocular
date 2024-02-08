import { IndexSettings } from "../types/search"
import {indexTypes}  from "../utils/search"
import Algolia, { SearchClient } from "algoliasearch"
import { AbstractSearchService } from "@ocular-ai/types"
import { SearchEngineOptions, SearchOptions } from "../types/search/options"
import { ConfigModule, Logger } from "../types"
import { RegisterOcularParameters } from "../types/ocular/ocular"
import OrganisationService from "./organisation"
import IndexerScript from "../scripts/indexer"
import { pipeline } from "stream"
import { SearchIndexClient } from "@azure/search-documents"
import JobSchedulerService from "./job-scheduler"

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
    const searchClient = this.searchIndexClient_.getSearchClient(indexName);
    const searchResults = await searchClient.search(query, {
      select: ["id", "title", "source", "content", "updated_at", "location"],
    })
    // Convert the PagedAsyncIterableIterator to an array
    const resultsArray = [];
    for await (const result of searchResults.results) {
      resultsArray.push(result);
    }
    return resultsArray;
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

  // Schedules jobs that index a companies data.
  async build() {
    console.log("Index Builder Build")
    // For each Org
    // Iterate though all apps installed in an org
    // For each app find an ocular and schedule an indexing job that takes in the Org, Oauth, Index name for indexing.

    // Iterate through all the Orgs
    // const orgs =  await this.organisationService_.list({})
    // const orgs = {}

    // // for(const org of orgs){
    // for (let i = 0; i < 3; i++) {
    //   // Indexer should be instatiated with a config and org info so that it knows where to
    //   // index the documents released by the ocular.
    //   // More efficeint because we create one connecting for each occulation
    //   // Indexer should be a reusable script and not a service.
    //   const indexer = new IndexerScript({searchIndexClient:this.searchIndexClient_, configModule: this.config_, organisation: orgs[i], logger: this.logger_ })

    //   // For each Ocular
    //    // Default Backend Ocular
    //    const occularType = "core-backend"
    //    const occular = await this.oculars[occularType].factory.getOcular(orgs[i]);

    //    console.log(`Collating documents for ${occularType} organisation ${orgs[i].name} via ${this.oculars[occularType].factory.constructor.name}`,);
      
    
    //   this.jobSchedulerService_.create(
    //     `publish-products-${occularType}-${orgs[i].id}`,
    //     {occularType}, 
    //     "* * * * *", 
    //     async () => {
    //     pipeline(
    //       [occular, indexer],
    //       (error: NodeJS.ErrnoException | null) => {
    //         if (error) {
    //           console.error(
    //             `Collating documents for ${occularType} failed: ${error}`,
    //           );
    //           // reject(error);
    //         } else {
    //           // Signal index pipeline completion!
    //           console.log(`Collating documents for ${occularType} succeeded`);
    //           // resolve();
    //         }
    //       },
    //     );
    //     }
    //   )
    // }
  }  
}

export default SearchService