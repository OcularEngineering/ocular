import { IndexSettings } from "../types/search"
import {indexTypes}  from "../utils/search"
import Algolia, { SearchClient } from "algoliasearch"
import { AbstractSearchService } from "../interfaces/search"
import { AlgoliaPluginOptions, SearchOptions } from "../types/search/algolia"
import { ConfigModule } from "../types"

class SearchService extends AbstractSearchService {
  isDefault = false

  protected readonly config_: ConfigModule
  protected readonly client_: SearchClient

  constructor(_, config) {
    super(_, config)

    this.config_ = config

    const { applicationId, adminApiKey, settings } = this.config_.projectConfig.search_options as AlgoliaPluginOptions

    if (!applicationId) {
      throw new Error("Please provide a valid Application ID")
    }

    if (!adminApiKey) {
      throw new Error("Please provide a valid Admin Api Key")
    }

    this.client_ = Algolia(applicationId, adminApiKey)
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
    const { paginationOptions, filter, additionalOptions } = options

    // fit our pagination options to what Algolia expects
    if ("limit" in paginationOptions && paginationOptions.limit != null) {
      paginationOptions["length"] = paginationOptions.limit
      delete paginationOptions.limit
    }

    return await this.client_.initIndex(indexName).search(query, {
      filters: filter,
      ...paginationOptions,
      ...additionalOptions,
    })
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
          this.config_.projectConfig.search_options.settings?.[indexTypes.PRODUCTS]
            ?.transformer
        return documents.map(productsTransformer)
      case indexTypes.USERS:
        const usersTransformer =
          this.config_.projectConfig.search_options.settings?.[indexTypes.USERS]
            ?.transformer
        return documents.map(usersTransformer)
      default:
        return documents
    }
  }
}

export default SearchService