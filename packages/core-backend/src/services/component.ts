import { EntityManager } from "typeorm";
import { TransactionBaseService } from "../types/interfaces";
import { CreateComponentInput, FilterableComponentProps } from "../types/component";
import { Component, User } from "../models";
import ComponentRepository from "../repositories/component";
import { buildQuery } from "../utils/build-query";
import { FindConfig } from "../types/common";
import { isDefined } from "../utils/is-defined";
import { AutoflowAiError } from "@ocular-ai/utils";

type InjectedDependencies = {
  componentRepository: typeof ComponentRepository
  manager: EntityManager
  loggedInUser: User
}

class ComponentService extends TransactionBaseService {

  protected readonly ComponentRepository_: typeof ComponentRepository
  protected readonly loggedInUser_: User

  constructor({ componentRepository, loggedInUser }: InjectedDependencies) {
    // eslint-disable-next-line prefer-rest-params
    super(arguments[0])
    this.ComponentRepository_ =  componentRepository

    try {
      this.loggedInUser_ = loggedInUser
    } catch (e) {
      // avoid errors when backend first runs
    }
  }
  
  async list(selector: FilterableComponentProps, config = {}): Promise<Component[]> {
    if(!this.loggedInUser_ || !this.loggedInUser_.organisation){
      throw new AutoflowAiError(
        AutoflowAiError.Types.NOT_FOUND,
        `User must belong to an "organisation" so as to get components`
      )
    }
    //Select only components that belong to the logged in user's organisation
    selector.organisation_id = this.loggedInUser_.organisation_id
    
    const ComponentRepo = this.activeManager_.withRepository(this.ComponentRepository_)
    return await ComponentRepo.find(buildQuery(selector, config))
  }

  async listAndCount(selector: FilterableComponentProps, config = {}): Promise<[Component[], number]> {
    if(!this.loggedInUser_ || !this.loggedInUser_.organisation){
      throw new AutoflowAiError(
        AutoflowAiError.Types.NOT_FOUND,
        `User must belong to an "organisation" so as to get components`
      )
    }
    //Select only components that belong to the logged in user's organisation
    selector.organisation_id = this.loggedInUser_.organisation_id
    const ComponentRepo = this.activeManager_.withRepository(this.ComponentRepository_)
    return await ComponentRepo.findAndCount(buildQuery(selector, config))
  }
  
  async create(component: CreateComponentInput): Promise<Component> {
    return await this.atomicPhase_(
      async (transactionManager: EntityManager) => {
        if(!this.loggedInUser_ || !this.loggedInUser_.organisation){
          throw new AutoflowAiError(
            AutoflowAiError.Types.NOT_FOUND,
            `User must belong to an "organisation" must be defined so as to add a component`
          )
        }
        const ComponentRepository = transactionManager.withRepository(
          this.ComponentRepository_
        )

        const created = ComponentRepository.create({organisation: this.loggedInUser_.organisation, ...component} )
        return await ComponentRepository.save(created)
      }
    )
  }

  async retrieve(ComponentId: string , config: FindConfig<Component> = {}): Promise<Component> {
    if (!isDefined(ComponentId)) {
      throw new AutoflowAiError(
        AutoflowAiError.Types.NOT_FOUND,
        `"ComponentId" must be defined`
      )
    }

    if(!this.loggedInUser_ || !this.loggedInUser_.organisation){
      throw new AutoflowAiError(
        AutoflowAiError.Types.NOT_FOUND,
        `User must belong to an "organisation" so as to get components`
      )
    }
  

    const ComponentRepo = this.activeManager_.withRepository(this.ComponentRepository_)
    //Select only components that belong to the logged in user's organisation
    const query = buildQuery({ id: ComponentId, organisation_id:this.loggedInUser_.organisation_id }, config)

    const componentEntity = await ComponentRepo.findOne(query)

    if (!componentEntity) {
      throw new AutoflowAiError(
        AutoflowAiError.Types.NOT_FOUND,
        `Enitity with id: ${ComponentId} was not found`
      )
    }

    return componentEntity
  }

  // async delete(ComponentIds: string | string[]): Promise<void> {
  //   const manager = this.activeManager_
  //   const ComponentRepo = manager.withRepository(this.ComponentRepository_)
  //   const ceIds = isString(ComponentIds) ? [ComponentIds] : ComponentIds

  //   await ComponentRepo.delete({ id: In(ceIds) })
  // }
}

export default ComponentService