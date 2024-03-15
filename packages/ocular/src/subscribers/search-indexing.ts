import { IEventBusService } from "@ocular/types"
import { defaultSearchIndexingProductRelations, indexTypes } from "../utils/search"
import OrganisationService from "../services/organisation"
import { BatchJobService, UserService } from "../services"
import { Organisation, User } from "../models"
import JobSchedulerService from "../services/job-scheduler"
import { AppNameDefinitions } from "@ocular/types"
import { INDEX_DOCUMENT_EVENT, BatchJobCreateProps } from "@ocular/types"
import { AzureKeyCredential, SearchClient, SearchIndex, SearchIndexClient} from "@azure/search-documents"
import { IndexableDocument } from "@ocular/types"
import { ConfigModule, Logger } from "../types"
import { SearchEngineOptions } from "../types/search/options"
import api from "../api"
import IndexerScript from "../scripts/indexer"
import { SEARCH_INDEX_EVENT } from "../loaders/search"


type InjectedDependencies = {
  eventBusService: IEventBusService
  batchJobService: BatchJobService
  organisationService: OrganisationService
  jobSchedulerService: JobSchedulerService
  configModule: ConfigModule
  logger: Logger
}

class SearchIndexingSubscriber {
  private readonly eventBusService_: IEventBusService
  private readonly batchJobService_: BatchJobService
  private readonly organisationService_: OrganisationService
  private readonly jobSchedulerService_: JobSchedulerService
  private readonly searchIndexClient_: SearchIndexClient;
  private readonly configModule_: ConfigModule;
  private readonly logger_: Logger

  constructor({
    eventBusService,
    batchJobService,
    organisationService,
    jobSchedulerService,
    configModule,
    logger,
  }: InjectedDependencies) {
    this.batchJobService_ = batchJobService
    this.organisationService_ = organisationService
    this.eventBusService_ = eventBusService
    this.jobSchedulerService_ = jobSchedulerService
    this.configModule_ = configModule
    this.logger_ = logger
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
            console.log(app.name)
            switch (app.name) {
              //   case AppNameDefinitions.GITHUB: {
              //   const jobProps: BatchJobCreateProps = {
              //       type: "github",
              //       context: {
              //           org: org
              //       },
              //       // created_by: "system",
              //       dry_run: false,
              //   }
              //   this.batchJobService_.create(jobProps)
              //   break;
              // }
              // case AppNameDefinitions.ASANA: {
              //   const jobProps: BatchJobCreateProps = {
              //       type: "asana",
              //       context: {
              //           org: org
              //       },
              //       // created_by: "system",
              //       dry_run: false,
              //   }
              //   this.batchJobService_.create(jobProps)
              //   break;
              // }
             
              // case AppNameDefinitions.GOOGLEDRIVE: {
              //   console.log("Creating Google Drive Job")
              //   const jobProps: BatchJobCreateProps = {
              //       type: "google-drive",
              //       context: {
              //           org: org
              //       },
              //       // created_by: "system",
              //       dry_run: false,
              //   }
              //   this.batchJobService_.create(jobProps)
              //   break;
              // }
               case AppNameDefinitions.GMAIL: {
                console.log("Creating GMAIL Job")
                const jobProps: BatchJobCreateProps = {
                    type: "gmail",
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

  registerIndexDocumentJobHandler = async (data:IndexableDocument[]): Promise<void> => {
    try{
    if(data.length == 0) return;
    const org = await this.organisationService_.retrieve(data[0].organisation_id)
    const indexer = await new IndexerScript({searchIndexClient:this.searchIndexClient_, configModule: this.configModule_, organisation:org, logger: this.logger_ })
    await indexer.index(data)
    }catch(e){
      console.error(e)
    }
  }
}

export default SearchIndexingSubscriber
