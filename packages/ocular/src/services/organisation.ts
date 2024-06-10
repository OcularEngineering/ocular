import { EntityManager } from "typeorm";
import { AppauthorizationService, TransactionBaseService } from "@ocular/types";
import { Organisation, User } from "../models";
import { OrganisationRepository } from "../repositories/organisation";
import AppAuthorizationRepository from "../repositories/app-authorization";

import { FindConfig } from "../types/common";
import { buildQuery } from "../utils/build-query";
import {
  CreateOrganisationInput,
  FilterableOrganisationProps,
  UpdateOrganisationInput,
} from "../types/organisation";
import { isDefined } from "../utils/is-defined";
import { AutoflowAiError, AutoflowAiErrorTypes } from "@ocular/utils";
import { AppNameDefinitions } from "@ocular/types";
import { AppRepository } from "../repositories";
import EventBusService from "./event-bus";
import AppAuthorizationService from "./app-authorization";
import { UpdateAuthInput } from "../types/app-authorization";

type InjectedDependencies = {
  manager: EntityManager;
  appRepository: typeof AppRepository;
  loggedInUser: User;
  organisationRepository: typeof OrganisationRepository;
  appAuthorizationService: AppAuthorizationService;
  eventBusService: EventBusService;
};

/**
 * Provides layer to manipulate store settings.
 */
class OrganisationService extends TransactionBaseService {
  protected readonly appRepository_: typeof AppRepository;
  protected readonly loggedInUser_: User | null;
  protected readonly organisationRepository_: typeof OrganisationRepository;
  protected appAuthorizationService_: AppAuthorizationService;
  protected readonly eventBusService_: EventBusService;

  constructor(container: InjectedDependencies) {
    // eslint-disable-next-line prefer-rest-params
    super(arguments[0]);
    this.appRepository_ = container.appRepository;
    this.organisationRepository_ = container.organisationRepository;
    this.eventBusService_ = container.eventBusService;
    this.appAuthorizationService_ = container.appAuthorizationService;

    try {
      this.loggedInUser_ = container.loggedInUser;
    } catch (e) {
      // avoid errors when backend first runs
    }
  }

  async create(organisation: CreateOrganisationInput): Promise<Organisation> {
    return await this.atomicPhase_(
      async (transactionManager: EntityManager) => {
        const organisationRepository = transactionManager.withRepository(
          this.organisationRepository_
        );
        const created = organisationRepository.create(organisation);
        const newOrganisation = await organisationRepository.save(created);
        return newOrganisation;
      }
    );
  }

  async retrieve(
    organisationId: string,
    config: FindConfig<Organisation> = {}
  ): Promise<Organisation> {
    if (!isDefined(organisationId)) {
      throw new AutoflowAiError(
        AutoflowAiError.Types.NOT_FOUND,
        `"organisationId" must be defined`
      );
    }

    const organisationRepo = this.activeManager_.withRepository(
      this.organisationRepository_
    );
    const query = buildQuery({ id: organisationId }, config);

    const organisations = await organisationRepo.find(query);

    if (!organisations.length) {
      throw new AutoflowAiError(
        AutoflowAiError.Types.NOT_FOUND,
        `User with id: ${organisationId} was not found`
      );
    }

    return organisations[0];
  }

  async list(
    selector: FilterableOrganisationProps,
    config = {}
  ): Promise<Organisation[]> {
    const organisationRepo = this.activeManager_.withRepository(
      this.organisationRepository_
    );
    return await organisationRepo.find(buildQuery(selector, config));
  }

  async installApp(name: AppNameDefinitions): Promise<Organisation> {
    return await this.atomicPhase_(
      async (transactionManager: EntityManager) => {
        // Check If The User Generating the Token Belongs To An Organisation
        if (!this.loggedInUser_ || !this.loggedInUser_.organisation) {
          throw new AutoflowAiError(
            AutoflowAiErrorTypes.NOT_FOUND,
            `User must belong to an "organisation" so as to add OAuth`
          );
        }

        const appRepository = transactionManager.withRepository(
          this.appRepository_
        );

        const app = await appRepository.findOne({ where: { name: name } });

        if (!isDefined(app)) {
          throw new AutoflowAiError(
            AutoflowAiError.Types.NOT_FOUND,
            `${app} must be defined to be installed`
          );
        }
        const organisation = await this.organisationRepository_.findOne({
          where: { id: this.loggedInUser_.organisation_id },
        });
        if (!organisation) {
          throw new AutoflowAiError(
            AutoflowAiError.Types.NOT_FOUND,
            `Org with not not found`
          );
        }

        organisation.addApp({ id: app.id, name: app.name });
        return await this.organisationRepository_.save(organisation);
      }
    );
  }

  async listInstalledApps(): Promise<Organisation> {
    if (!this.loggedInUser_ || !this.loggedInUser_.organisation) {
      throw new AutoflowAiError(
        AutoflowAiError.Types.NOT_FOUND,
        `User must belong to an "organisation" so as to get components`
      );
    }
    return await this.organisationRepository_.findOne({
      where: { id: this.loggedInUser_.organisation_id },
    });
  }

  async update(
    org_id: string,
    data: UpdateOrganisationInput
  ): Promise<Organisation> {
    return await this.atomicPhase_(
      async (transactionManager: EntityManager) => {
        const organisationRepo = this.activeManager_.withRepository(
          this.organisationRepository_
        );

        const { installed_apps } = data;

        const organisation = await this.retrieve(org_id);

        if (!organisation) {
          throw new AutoflowAiError(
            AutoflowAiError.Types.NOT_FOUND,
            `Organisation with id ${org_id} was not found`
          );
        }

        if (installed_apps) {
          organisation.installed_apps = organisation.installed_apps.map(
            (app) => {
              // Find the installed app update for this app
              const installedAppUpdate = installed_apps.find(
                (installedApp) => installedApp.name === app.name
              );
              app = installedAppUpdate;
              app.installation_id = installedAppUpdate?.installation_id;
              app.permissions = installedAppUpdate?.permissions;

              // If an update is found, return the updated app, otherwise return the original app
              return app;
            }
          );
        }
        return await organisationRepo.save(organisation);
      }
    );
  }
}
export default OrganisationService;
