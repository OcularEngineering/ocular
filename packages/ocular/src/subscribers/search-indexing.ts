import {
  IndexableDocument,
  AppNameDefinitions,
  IEventBusService,
  INDEX_DOCUMENT_EVENT,
  BatchJobCreateProps,
} from "@ocular/types";
import {
  defaultSearchIndexingProductRelations,
  indexTypes,
} from "../utils/search";
import OrganisationService from "../services/organisation";
import { BatchJobService, UserService } from "../services";
import { Organisation, User } from "../models";
import JobSchedulerService from "../services/job-scheduler";
import { ConfigModule, Logger } from "../types";
import { SearchEngineOptions } from "../types/search/options";
import api from "../api";
import IndexerService from "../services/indexer";
import { SEARCH_INDEX_EVENT } from "../loaders/search";
import OAuthService from "../services/oauth";
import { orgIdToIndexName } from "@ocular/utils";

type InjectedDependencies = {
  indexerService: IndexerService;
  eventBusService: IEventBusService;
  batchJobService: BatchJobService;
  organisationService: OrganisationService;
  jobSchedulerService: JobSchedulerService;
  configModule: ConfigModule;
  logger: Logger;
  indexName: string;
};

class SearchIndexingSubscriber {
  private readonly indexerService_: IndexerService;
  private readonly eventBusService_: IEventBusService;
  private readonly batchJobService_: BatchJobService;
  private readonly organisationService_: OrganisationService;
  private readonly jobSchedulerService_: JobSchedulerService;
  private readonly configModule_: ConfigModule;
  private readonly logger_: Logger;
  private readonly indexName_: string;

  constructor({
    indexerService,
    eventBusService,
    batchJobService,
    organisationService,
    jobSchedulerService,
    configModule,
    logger,
    indexName,
  }: InjectedDependencies) {
    this.indexerService_ = indexerService;
    this.batchJobService_ = batchJobService;
    this.organisationService_ = organisationService;
    this.eventBusService_ = eventBusService;
    this.jobSchedulerService_ = jobSchedulerService;
    this.logger_ = logger;
    this.eventBusService_.subscribe(SEARCH_INDEX_EVENT, this.buildSearchIndex);
    this.eventBusService_.subscribe(
      INDEX_DOCUMENT_EVENT,
      this.registerIndexDocumentJobHandler
    );
    this.eventBusService_.subscribe(
      OAuthService.Events.TOKEN_GENERATED,
      this.addSearchIndexingJob
    );
    console.log("CHECKING SUBSCRIPTION!");
    this.eventBusService_.subscribe(
      "webConnectorInstalled",
      this.addSearchIndexingJobWebConnector
    );
    console.log("CHECKING SUBSCRIPTION! DONE");
    this.indexName_ = indexName;
  }

  buildSearchIndex = async (): Promise<void> => {
    console.error("Building Search Indexes");
    await this.indexerService_.createIndex(this.indexName_);
    const orgs: Organisation[] = await this.organisationService_.list({});
    console.log("BUILDING SEARCH EVENT ORG APPS", orgs);
    orgs.forEach((org) => {
      if (!org.installed_apps) return;
      this.jobSchedulerService_.create(
        `Sync Apps Data for ${org.name}`,
        { org: org },
        "*/10 * * * *",
        async () => {
          org.installed_apps.forEach((app) => {
            console.log(app.name);
            switch (
              app.name
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
              //  case AppNameDefinitions.GMAIL: {
              //   console.log("Creating GMAIL Job")
              //   const jobProps: BatchJobCreateProps = {
              //       type: "gmail",
              //       context: {
              //           org: org
              //       },
              //       // created_by: "system",
              //       dry_run: false,
              //   }
              //   this.batchJobService_.create(jobProps)
              //   break;
              // }
              // default: {
              //   //this.logger_.error(`App ${app.name} not supported for indexing`)
              // }
            ) {
            }
          });
        }
      );
    });
  };

  // Registers The Handler To Handle Docs Sent To Ocular By Apps.
  registerIndexDocumentJobHandler = async (
    data: IndexableDocument[]
  ): Promise<void> => {
    try {
      if (data.length == 0) return;
      console.log("Indexing Data", data.length);
      console.log(data[0]);
      const org = await this.organisationService_.retrieve(
        data[0].organisationId
      );
      await this.indexerService_.indexDocuments(this.indexName_, data);
    } catch (e) {
      console.error(e);
    }
  };

  addSearchIndexingJobWebConnector = async (data): Promise<void> => {
    const { organisation, app_name, link, link_id } = data;
    console.log("EMITTING JOB", organisation, app_name, link, link_id);
    const jobProps: BatchJobCreateProps = {
      type: app_name,
      context: {
        org: organisation,
        link: link,
        link_id,
      },
      // created_by: "system",
      dry_run: false,
    };
    this.batchJobService_.create(jobProps);
  };

  // Schedules An jndexing job when an app is installed by an organization.
  addSearchIndexingJob = async (data): Promise<void> => {
    const { organisation, app_name } = data;

    if (app_name === AppNameDefinitions.WEBCONNECTOR) {
      return;
    }

    this.jobSchedulerService_.create(
      `Sync Apps Data for ${organisation.name}`,
      { org: organisation },
      "* * * * *",
      async () => {
        const jobProps: BatchJobCreateProps = {
          type: app_name,
          context: {
            org: organisation,
          },
          // created_by: "system",
          dry_run: false,
        };
        this.batchJobService_.create(jobProps);
      }
    );
  };
}

export default SearchIndexingSubscriber;
