import { EntityManager} from "typeorm"
import { TransactionBaseService } from "../interfaces"
import {Organisation} from "../models"
import { OrganisationRepository } from "../repositories/organisation"
import { FindConfig } from "@ocular-ai/types"
import { buildQuery} from "../utils/build-query"
import {CreateOrganisationInput, FilterableOrganisationProps} from "../types/organisation"
import { isDefined} from "../utils/is-defined"
import AutoflowAiError from "../utils/error"

type InjectedDependencies = {
  manager: EntityManager
  organisationRepository: typeof OrganisationRepository
}

/**
 * Provides layer to manipulate store settings.
 */
class OrganisationService extends TransactionBaseService {
  protected readonly organisationRepository_: typeof OrganisationRepository

  constructor({
    organisationRepository,
  }: InjectedDependencies) {
    // eslint-disable-next-line prefer-rest-params
    super(arguments[0])

    this.organisationRepository_ = organisationRepository
  }


  async create(organisation: CreateOrganisationInput): Promise<Organisation> {
    return await this.atomicPhase_(
      async (transactionManager: EntityManager) => {
        const organisationRepository = transactionManager.withRepository(
          this.organisationRepository_
        )
        const created = organisationRepository.create(organisation)
        const newOrganisation = await organisationRepository.save(created)
        return  newOrganisation
      }
    )
  }


  async retrieve(organisationId: string , config: FindConfig<Organisation> = {}): Promise<Organisation> {
      if (!isDefined(organisationId)) {
      throw new AutoflowAiError(
        AutoflowAiError.Types.NOT_FOUND,
        `"organisationId" must be defined`
      )
    }

    const organisationRepo = this.activeManager_.withRepository(this.organisationRepository_)
    const query = buildQuery({ id: organisationId}, config)

    const organisations = await organisationRepo.find(query)

    if (!organisations.length) {
      throw new AutoflowAiError(
        AutoflowAiError.Types.NOT_FOUND,
        `User with id: ${organisationId} was not found`
      )
    }

    return organisations[0]
  }

  async list(selector: FilterableOrganisationProps, config = {}): Promise<Organisation[]> {
    const organisationRepo = this.activeManager_.withRepository(this.organisationRepository_)
    return await organisationRepo.find(buildQuery(selector, config))
  }
}
export default OrganisationService;