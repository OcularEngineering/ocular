import { EntityManager } from "typeorm";
import {
  AppNameDefinitions,
  Logger,
  TransactionBaseService,
} from "@ocular/types";
import EventBusService from "./event-bus";
import { AutoflowContainer } from "@ocular/types";
import { AutoflowAiError, AutoflowAiErrorTypes } from "@ocular/utils";
import { App, User } from "../models";
import { buildQuery } from "../utils/build-query";
import {
  CreateAuthInput,
  RetrieveAuthConfig,
  UpdateAuthInput,
} from "../types/app-authorization";
import { AppAuthorization } from "../models";
import AppService from "./app";
import AppAuthorizationRepository from "../repositories/app-authorization";
import { Selector } from "../types/common";
import { AuthToken } from "@ocular/types";

type InjectedDependencies = AutoflowContainer & {
  manager: EntityManager;
  eventBusService: EventBusService;
  appService: AppService;
  appAuthorizationRepository: typeof AppAuthorizationRepository;
  loggedInUser: User;
  logger: Logger;
};

class AppAuthorizationService extends TransactionBaseService {
  static Events = {
    TOKEN_GENERATED: "oauth.token_generated",
    TOKEN_REFRESHED: "oauth.token_refreshed",
    WEB_CONNECTOR_INSTALLED: "webConnectorInstalled",
  };

  protected container_: InjectedDependencies;
  protected appService_: AppService;
  protected appAuthorizationRepository_: typeof AppAuthorizationRepository;
  protected eventBus_: EventBusService;
  protected readonly loggedInUser_: User;
  protected readonly logger_: Logger;

  constructor(container: InjectedDependencies) {
    super(container);

    this.container_ = container;
    this.appService_ = container.appService;
    this.eventBus_ = container.eventBusService;
    this.appAuthorizationRepository_ = container.appAuthorizationRepository;
    this.logger_ = container.logger;

    try {
      this.loggedInUser_ = container.loggedInUser;
    } catch (e) {
      // avoid errors when backend first runs
    }
  }

  // Expose this to Internal Services Only
  // Hack To Expose This Credientals To Indexing Apps
  async retrieve(
    retrieveConfig: RetrieveAuthConfig
  ): Promise<AppAuthorization> {
    const authRepo = this.activeManager_.withRepository(
      this.appAuthorizationRepository_
    );
    const authToken = await authRepo.findOne({
      where: {
        organisation_id: retrieveConfig.id,
        app_name: retrieveConfig.app_name,
      },
    });
    return authToken as AppAuthorization;
  }

  async retrieveById({
    app_id,
  }: {
    app_id: string;
  }): Promise<AppAuthorization> {
    const authRepo = this.activeManager_.withRepository(
      this.appAuthorizationRepository_
    );
    const authToken = await authRepo.findOne({
      where: {
        id: app_id,
      },
    });
    return authToken as AppAuthorization;
  }

  // List Apps Owned BY The Logged In User
  async list(
    selector: Selector<AppAuthorization>
  ): Promise<AppAuthorization[]> {
    if (!this.loggedInUser_ || !this.loggedInUser_.organisation) {
      throw new AutoflowAiError(
        AutoflowAiErrorTypes.NOT_FOUND,
        `User must belong to an "organisation" so as to get components`
      );
    }
    //Select only apps that belong to the logged in user's organisation
    const appRepo = this.activeManager_.withRepository(
      this.appAuthorizationRepository_
    );
    selector["organisation_id"] = this.loggedInUser_.organisation_id;
    const query = buildQuery(selector, {});
    return await appRepo.find(query);
  }

  async create(app: CreateAuthInput): Promise<AppAuthorization> {
    if (!this.loggedInUser_ || !this.loggedInUser_.organisation) {
      throw new AutoflowAiError(
        AutoflowAiErrorTypes.NOT_FOUND,
        `User must belong to an "organisation" must be defined to create an OAuth`
      );
    }
    const authRepo = this.activeManager_.withRepository(
      this.appAuthorizationRepository_
    );
    const application = authRepo.create({
      organisation: this.loggedInUser_.organisation,
      ...app,
    });
    return (await authRepo.save(application)) as AppAuthorization;
  }

  async generateToken(
    name: string,
    code: string,
    installationId?: string
  ): Promise<AppAuthorization> {
    try {
      this.logger_.info(`generateToken: Generating Token for App ${name}`);
      // Check If The User Generating the Token Belongs To An Organisation
      if (!this.loggedInUser_ || !this.loggedInUser_.organisation) {
        throw new AutoflowAiError(
          AutoflowAiErrorTypes.NOT_FOUND,
          `User must belong to an "organisation" so as to add OAuth`
        );
      }

      const app: App = await this.appService_.retrieveByName(name);

      if (!app) {
        throw new AutoflowAiError(
          AutoflowAiErrorTypes.NOT_FOUND,
          `Application ${name} not found`
        );
      }

      const service = this.container_[`${app.name}Oauth`];
      if (!service) {
        throw new AutoflowAiError(
          AutoflowAiErrorTypes.INVALID_DATA,
          `An OAuth handler for ${app.name} could not be found make sure the app is registered in the Ocular Core.`
        );
      }

      const token: AuthToken = await service.generateToken(
        code,
        installationId
      );
      console.log(" Slack Token", token);
      const authToken = this.appAuthorizationRepository_.find({
        where: {
          organisation_id: this.loggedInUser_.organisation_id,
          app_name: app.name,
        },
      });

      if (authToken) {
        await this.appAuthorizationRepository_.delete({
          organisation_id: this.loggedInUser_.organisation_id,
          app_name: app.name,
        });
      }
      // Create An OAuth For This App And Organisation
      return await this.create({
        type: token.type,
        token: token.token,
        token_expires_at: token.token_expires_at,
        auth_strategy: token.auth_strategy,
        refresh_token: token.refresh_token,
        refresh_token_expires_at: token.refresh_token_expires_at,
        organisation: this.loggedInUser_.organisation,
        app_name: app.name,
        metadata: token.metadata,
      }).then(async (result) => {
        await this.eventBus_.emit(
          AppAuthorizationService.Events.TOKEN_GENERATED,
          {
            organisation: this.loggedInUser_.organisation,
            app_name: app.name,
          }
        );
        return result;
      });
      this.logger_.info(`generateToken: Done Generating Token for App ${name}`);
    } catch (error) {
      this.logger_.error(
        `generateToken: Failed to generate token for ${name} with error: ${error.message}`
      );
      return null;
    }
  }

  async updateInstalledApp(
    app_name: string,
    app_id: string,
    data: any
  ): Promise<string | null> {
    return this.atomicPhase_(async (transactionManager: EntityManager) => {
      try {
        switch (app_name) {
          case AppNameDefinitions.WEBCONNECTOR:
            // Retrieve the Auth token
            const authToken = await this.retrieveById({ app_id });

            if (!authToken) {
              throw new AutoflowAiError(
                AutoflowAiError.Types.NOT_FOUND,
                `No Authorization token found for ${AppNameDefinitions.WEBCONNECTOR}`
              );
            }

            const metadata = authToken.metadata;

            // Ensure metadata.links is initialized as an array
            if (!metadata.links) {
              metadata.links = [];
            }

            if (Array.isArray(metadata.links)) {
              metadata.links.push({
                id: data.link_id,
                location: data.link,
                status: data.status,
                title: data.title,
                description: data.description,
              });
            }

            // Update the metadata in OAuth token
            await this.update(authToken.id, {
              metadata,
            } as UpdateAuthInput);

            // Emit event if required
            if (data.emit_event) {
              await this.eventBus_.emit(
                AppAuthorizationService.Events.WEB_CONNECTOR_INSTALLED,
                {
                  organisation: this.loggedInUser_.organisation,
                  app_name: AppNameDefinitions.WEBCONNECTOR,
                  link: data.link,
                  link_id: data.link_id,
                }
              );
            }

            return "WebConnector Link saved Succesfully";

          default:
            return "No such App exists in the system to update";
        }
      } catch (error) {
        console.error(`Failed to update installed app: ${error.message}`);
        return null;
      }
    });
  }

  async update(id: string, update: UpdateAuthInput): Promise<AppAuthorization> {
    const repo = this.activeManager_.withRepository(
      this.appAuthorizationRepository_
    );

    const appAuth = await this.appAuthorizationRepository_.findOne({
      where: {
        id: id,
      },
    });

    const {
      last_sync,
      token,
      token_expires_at,
      refresh_token,
      refresh_token_expires_at,
      metadata,
    } = update;

    if (last_sync) {
      appAuth.last_sync = last_sync;
    }
    if (token) {
      appAuth.token = token;
    }
    if (token_expires_at) {
      appAuth.token_expires_at = token_expires_at;
    }
    if (refresh_token) {
      appAuth.refresh_token = refresh_token;
    }
    if (refresh_token_expires_at) {
      appAuth.refresh_token_expires_at = refresh_token_expires_at;
    }

    if (metadata) {
      appAuth.metadata = metadata;
    }

    return (await repo.save(appAuth)) as AppAuthorization;
  }
}

export default AppAuthorizationService;
