import { IEventBusService } from "@ocular-ai/types"
import { defaultSearchIndexingProductRelations, indexTypes } from "../utils/search"
import OrganisationService from "../services/organisation"
import { BatchJobService, UserService } from "../services"
import { Organisation, User } from "../models"
import JobSchedulerService from "../services/job-scheduler"
import { AppNameDefinitions } from "@ocular-ai/types"
import { SEARCH_INDEX_EVENT } from "../loaders/search"
import { BatchJobCreateProps } from "../types/batch-job"
import { INDEX_DOCUMENT_EVENT } from "@ocular-ai/types"
import { AzureKeyCredential, SearchClient, SearchIndex, SearchIndexClient} from "@azure/search-documents"
import { IndexableDocument } from "@ocular-ai/types/src/common"
import { ConfigModule } from "../types"
import { SearchEngineOptions } from "../types/search/options"
import api from "../api"


type InjectedDependencies = {
  eventBusService: IEventBusService
  batchJobService: BatchJobService
  organisationService: OrganisationService
  jobSchedulerService: JobSchedulerService
  configModule: ConfigModule
}

class SearchIndexingSubscriber {
  private readonly eventBusService_: IEventBusService
  private readonly batchJobService_: BatchJobService
  private readonly organisationService_: OrganisationService
  private readonly jobSchedulerService_: JobSchedulerService
  private readonly searchIndexClient_: SearchIndexClient;
  private readonly configModule_: ConfigModule;

  constructor({
    eventBusService,
    batchJobService,
    organisationService,
    jobSchedulerService,
    configModule
  }: InjectedDependencies) {
    this.batchJobService_ = batchJobService
    this.organisationService_ = organisationService
    this.eventBusService_ = eventBusService
    this.jobSchedulerService_ = jobSchedulerService
    this.configModule_ = configModule
    this.searchIndexClient_ = new SearchIndexClient(configModule.projectConfig.search_engine_options.endpoint, new AzureKeyCredential(configModule.projectConfig.search_engine_options.apiKey))
    this.eventBusService_.subscribe(SEARCH_INDEX_EVENT, this.buildSearchIndex)
    this.eventBusService_.subscribe(INDEX_DOCUMENT_EVENT, this.registerIndexDocumentJobHandler )
  }

  // Schedules Jobs That Build The Search Indexes For The Organisations in Ocular
  buildSearchIndex = async (): Promise<void> => {
      console.error("Building Search Indexes")
      const orgs: Organisation[] =  await this.organisationService_.list({})
      orgs.forEach((org) => {
        if (!org.installed_apps) return;
        this.jobSchedulerService_.create(`Sync Apps Data for ${org.name}`, {org: org}, "* * * * *", async () => {
          org.installed_apps.forEach((app) => {
            switch (app.name) {
                case AppNameDefinitions.GITHUB: {
                const jobProps: BatchJobCreateProps = {
                    type: "github",
                    context: {
                        org: org
                    },
                    // created_by: "system",
                    dry_run: false,
                }
                this.batchJobService_.create(jobProps)
                break;
              }
              default: {
                //this.logger_.error(`App ${app.name} not supported for indexing`)
              }
          }
          })
      })
    })
  }

  registerIndexDocumentJobHandler = async (data:IndexableDocument): Promise<void> => {
    try{

      const indexName =  data.organisation_id.toLowerCase().substring(4);
      console.error(`Indexing Document in JOBSERVICE ${data.title}`)
      const searchIndex: SearchIndex = {
        name: indexName,
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
          // {
          //   name: "content", 
          //   type: "Collection(Edm.ComplexType)", 
          //   fields: [
          //     { name: "text", type: "Edm.String", searchable: true },
          //     { name: "link", type: "Edm.String", searchable: false }
          //   ]
          // },
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


      await this.searchIndexClient_.createOrUpdateIndex(searchIndex) ;
      // const { batchSize, settings,endpoint,apiKey } = this.configModule_.projectConfig.search_engine_options as SearchEngineOptions
      const searchClient: SearchClient<IndexableDocument> = new SearchClient<IndexableDocument>(
        this.configModule_.projectConfig.search_engine_options.endpoint,
        indexName,
        new AzureKeyCredential(this.configModule_.projectConfig.search_engine_options.apiKey)
      );
      await searchClient.uploadDocuments([data]);
    }catch(e){
      console.error(e)
    }
  }
}

export default SearchIndexingSubscriber
