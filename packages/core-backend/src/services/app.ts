import { EntityManager } from "typeorm"
import { TransactionBaseService } from "../interfaces"
import EventBusService from "./event-bus"
import { AutoflowContainer } from "@ocular-ai/types"
import { AppRepository} from "../repositories"
import { AutoflowAiError } from "@ocular-ai/utils"
import { isDefined } from "../utils/is-defined"
import { App, User } from "../models"
import { buildQuery } from "../utils/build-query"
import { CreateAppInput,RegisterAppInput } from "../types/app"
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

  async registerAppOnStartUp(registerInput: RegisterAppInput): Promise<App> {
    const { name } = registerInput
    const app = await this.retrieveByName(name)

    if (app) {
      throw new AutoflowAiError(
        AutoflowAiError.Types.NOT_FOUND,
        `"AppName" must be defined`
      )
    }
    
    app.install_url = registerInput.install_url
    app.uninstall_url = registerInput.uninstall_url

    const appRepo = this.activeManager_.withRepository(this.appRepository_)
    return await appRepo.save(app)
  }

  async retrieveByName(appName: string): Promise<App> {

    if (!isDefined(appName)) {
      throw new AutoflowAiError(
        AutoflowAiError.Types.NOT_FOUND,
        `"AppName" must be defined`
      )
    }

    const appRepo = this.activeManager_.withRepository(this.appRepository_)
    const query = buildQuery({  application_name: appName} )

    const app = await appRepo.findOne(query)

    if (!app) {
      throw new AutoflowAiError(
        AutoflowAiError.Types.NOT_FOUND,
        `Application ${appName} not found`
      )
    }

    return app
  }

  async retrieve(appId: string, config: FindConfig<App> = {}): Promise<App> {
    if (!isDefined(appId)) {
      throw new AutoflowAiError(
        AutoflowAiError.Types.NOT_FOUND,
        `"appId" must be defined`
      )
    }

    //Select only apps that belong to the logged in user's organisation
    const appRepo = this.activeManager_.withRepository(this.appRepository_)
    const query = buildQuery({ id: appId },config)

    const app = await appRepo.findOne(query)

    if (!app) {
      throw new AutoflowAiError(
        AutoflowAiError.Types.NOT_FOUND,
        `Application with id not found`
      )
    }

    return app
  }

  async list(selector: Selector<App>): Promise<App[]> {
    //Select only apps that belong to the logged in user's organisation
    const appRepo = this.activeManager_.withRepository(this.appRepository_)
    const query = buildQuery(selector, {})
    return await appRepo.find(query)
  }

  async create(app: CreateAppInput): Promise<App> {
    const appRepo = this.activeManager_.withRepository(this.appRepository_)
    const application = appRepo.create(app)
    return await appRepo.save(application)
  }
}

export default AppService;