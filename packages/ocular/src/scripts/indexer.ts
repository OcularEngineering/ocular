import { IndexableDocument, IndexFields, semanticSearchProfile ,vectorSearchProfile } from '@ocular/types';
import { Readable } from 'stream';
import { ConfigModule } from "../types/config-module";
import { SearchEngineOptions } from "../types/search/options";
import { SearchIndexClient, AzureKeyCredential,SearchIndex,SearchClient, SearchIndexingBufferedSender} from "@azure/search-documents";
import { Lifetime } from "awilix"
import { Logger, BatchSearchEngineIndexer } from "@ocular/types";
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

    const searchIndex: SearchIndex = {
      name: this.indexName,
      fields: IndexFields,
      vectorSearch: vectorSearchProfile,
      semanticSearch:semanticSearchProfile,
    }
    this.searchIndexClient_.createOrUpdateIndex(
      searchIndex
    );
  }


  async initialize(): Promise<void> {
    this.logger_.info(`Initializing Search Index ${this.organisation_.id} belonging to ${this.organisation_.name}...`);
    // Migrate The Index Fields To Their Own File For Cleaner Code
    // const searchIndex: SearchIndex = {
    //   name: this.indexName,
    //   fields: IndexFields,
    //   vectorSearch: vectorSearchProfile,
    //   semanticSearch:semanticSearchProfile,
    // }
    // await this.searchIndexClient_.createOrUpdateIndex(
    //   searchIndex
    // );
  }

  async index(documents: IndexableDocument[]): Promise<void> {
    this.logger_.info(`Indexing ${documents[0]} documents in index ${this.indexName}...`);
    console.log(documents[0]);

    // Optimize Here And Avoid Creating A New Client For Each Batch
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