import {BatchSearchEngineIndexer} from "../interfaces";
import { IndexableDocument, indexFields } from '../types/search';
import { Readable } from 'stream';
import { ConfigModule } from "../types/config-module";
import { SearchEngineOptions } from "../types/search/options";
import { SearchIndexClient, AzureKeyCredential,SearchIndex,SearchClient, SearchIndexingBufferedSender} from "@azure/search-documents";
import { Lifetime } from "awilix"
import { Logger } from "@ocular-ai/types";
import e from "express";
import { Organisation } from "../models";


type IndexerScriptProps = {
  logger: Logger
  searchIndexClient: SearchIndexClient
  configModule: ConfigModule
  organisation: Organisation
}

function duration(startTimestamp: [number, number]): string {
  const delta = process.hrtime(startTimestamp);
  const seconds = delta[0] + delta[1] / 1e9;
  return `${seconds.toFixed(1)}s`;
}

export const documentKeyRetriever: (document: IndexableDocument) => string = (document: IndexableDocument): string => {
  return document.id;
};

/**
 * Search Engine Indexer Script.
 */
class IndexerScript extends BatchSearchEngineIndexer{

  static LIFE_TIME = Lifetime.TRANSIENT;

  private readonly configModule_: ConfigModule;
  private readonly logger_: Logger;
  private readonly searchIndexClient_: SearchIndexClient;
  private readonly apiKey_: string;
  private readonly endpoint_: string;

  private processed: number = 0;
  private removableIndices: string[] = [];
  private readonly startTimestamp: [number, number];
  public readonly indexName: string;
  private readonly organisation_: Organisation;

  constructor(
    {
      logger,
      searchIndexClient,
      configModule,
      organisation,
    }: IndexerScriptProps,
  ) {
    // @ts-ignore
    // eslint-disable-next-line prefer-rest-params
    
    super({ batchSize: configModule.projectConfig.search_engine_options.batchSize});
    // Grab config values from the config module

    this.configModule_ = configModule
    const { batchSize, settings,endpoint,apiKey } = this.configModule_.projectConfig.search_engine_options as SearchEngineOptions
    this.logger_ = logger
    this.apiKey_ = apiKey
    this.endpoint_ = endpoint
    this.searchIndexClient_ = searchIndexClient
    this.organisation_ = organisation
    // Hack to make index name acceptable bt azure search, index name should be generated on organisation creation.
    this.indexName = this.organisation_.id.toLowerCase().substring(4);
    console.log(this.indexName);

  }


  async initialize(): Promise<void> {
    this.logger_.info(`Initializing Search Index ${this.organisation_.id} belonging to ${this.organisation_.name}...`);
    // Migrate The Index Fields To Their Own File For Cleaner Code
    const searchIndex: SearchIndex = {
      name: this.indexName,
      fields: [
        {
          name: "id",
          type: "Edm.String",
          key: true,
          searchable: false,
        },
        {
          name: "organisation_id",
          type: "Edm.String",
          filterable: true,
        },
        { 
          name: "title",
          type: "Edm.String",
          searchable: true,
          sortable: true
         },
        { 
          name: "source", 
          type: "Edm.String", 
          searchable: true,
          sortable: true , 
          filterable: true
        },
        {
          name: "content", 
          type: "Collection(Edm.ComplexType)", 
          fields: [
            { name: "text", type: "Edm.String", searchable: true },
            { name: "link", type: "Edm.String", searchable: false }
          ]
        },
        { 
          name: "updated_at", 
          type: "Edm.DateTimeOffset", 
          sortable: true, 
          facetable: true,
          searchable: false,
        },
        {
          name: "location",
          type: "Edm.String",
          searchable: false,
        },
      ],
    }
    await this.searchIndexClient_.createOrUpdateIndex(searchIndex);
  }

  async index(documents: IndexableDocument[]): Promise<void> {
    this.logger_.info(`Indexing ${documents[0]} documents...`);
    console.log(documents[0]);

    const searchClient: SearchClient<IndexableDocument> = new SearchClient<IndexableDocument>(
      this.endpoint_,
      this.indexName,
      new AzureKeyCredential(this.apiKey_)
    );
    await searchClient.uploadDocuments(documents);
  }

  async finalize(): Promise<void> {
    this.logger_.info(
      `Indexing completed for index ${this.indexName} in ${duration(
        this.startTimestamp,
      )}`,
    );
  }
}

export default IndexerScript