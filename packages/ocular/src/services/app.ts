import { EntityManager } from "typeorm"
import { TransactionBaseService } from "@ocular/types"
import EventBusService from "./event-bus"
import { AutoflowContainer } from "@ocular/types"
import { AppRepository} from "../repositories"
import { AutoflowAiError } from "@ocular/utils"
import { isDefined } from "../utils/is-defined"
import { App, User } from "../models"
import { buildQuery } from "../utils/build-query"
import { RegisterAppInput } from "../types/app"
import { FindConfig, Selector } from "../types/common"


type InjectedDependencies = AutoflowContainer & {
  manager: EntityManager
  eventBusService: EventBusService
  appRepository: typeof AppRepository
  loggedInUser: User
}

class AppService extends TransactionBaseService {

  protected container_: InjectedDependencies
  protected appRepository_: typeof AppRepository
  protected eventBus_: EventBusService

  constructor(container: InjectedDependencies) {
    super(container)

    this.container_ = container
    this.appRepository_ = container.appRepository
    this.eventBus_ = container.eventBusService
  }

  // async create(app: CreateAppInput): Promise<App> {

  //   const application = appRepo.create(app)
  //   return await appRepo.save(application)
  // }

  async register(app: RegisterAppInput): Promise<App> {
    return await this.atomicPhase_(async (manager) => {
      const appRepo = this.activeManager_.withRepository(this.appRepository_)
      
      // Try to find the existing application
      let application = await appRepo.findOne({ where: { name: app.name} });

      if (application) {
        // If application exists, update all fields except name and identifier
        Object.keys(app).forEach((key) => {
          if (key !== 'name' && key !== 'identifier') {
            application[key] = app[key];
          }
        });
      } else {
        // If application does not exist, create a new one
        application = appRepo.create({...app});
      }
      
      return await appRepo.save(application);
    })
  }

  async retrieveByName(appName: string): Promise<App> {

    if (!isDefined(appName)) {
      throw new AutoflowAiError(
        AutoflowAiError.Types.NOT_FOUND,
        `"AppName" must be defined`
      )
    }

    const appRepo = this.activeManager_.withRepository(this.appRepository_)
    const query = buildQuery({  name: appName} )

    const app = await appRepo.findOne(query)

    if (!app) {
      throw new AutoflowAiError(
        AutoflowAiError.Types.NOT_FOUND,
        `Application ${appName} not found`
      )
    }

    return app
  }

  // async retrieve(appId: string, config: FindConfig<App> = {}): Promise<App> {
  //   if (!isDefined(appId)) {
  //     throw new AutoflowAiError(
  //       AutoflowAiError.Types.NOT_FOUND,
  //       `"appId" must be defined`
  //     )
  //   }

  //   //Select only apps that belong to the logged in user's organisation
  //   const appRepo = this.activeManager_.withRepository(this.appRepository_)
  //   const query = buildQuery({ id: appId },config)

  //   const app = await appRepo.findOne(query)

  //   if (!app) {
  //     throw new AutoflowAiError(
  //       AutoflowAiError.Types.NOT_FOUND,
  //       `Application with id not found`
  //     )
  //   }

  //   return app
  // }

  async list(selector: Selector<App>): Promise<App[]> {
    const appRepo = this.activeManager_.withRepository(this.appRepository_)
    const query = buildQuery(selector, {})
    return await appRepo.find(query)
  }

 
}

export default AppService;