import { EntityManager } from "typeorm"
import { TransactionBaseService } from "@ocular-ai/types"
import EventBusService from "./event-bus"
import { AutoflowContainer } from "@ocular-ai/types"
import { AutoflowAiError,AutoflowAiErrorTypes } from "@ocular-ai/utils"
import { App, User } from "../models"
import { buildQuery } from "../utils/build-query"
import { CreateOAuthInput } from "../types/oauth"
import  {OAuth} from "../models"
import AppService from "./app"
import OAuthRepository from "../repositories/oauth"
import { Selector } from "../types/common"


type InjectedDependencies = AutoflowContainer & {
  manager: EntityManager
  eventBusService: EventBusService
  appService: AppService
  oauthRepository: typeof OAuthRepository
  loggedInUser: User
}



class OAuthService extends TransactionBaseService {

  static Events = {
    TOKEN_GENERATED: "oauth.token_generated",
    TOKEN_REFRESHED: "oauth.token_refreshed",
  }

  protected container_: InjectedDependencies
  protected appService_: AppService
  protected oauthRepository_: typeof OAuthRepository
  protected eventBus_: EventBusService
  protected readonly loggedInUser_: User

  constructor(container: InjectedDependencies) {
    super(container)

    this.container_ = container
    this.appService_ = container.appService
    this.eventBus_ = container.eventBusService
    this.oauthRepository_ = container.oauthRepository

    try {
      this.loggedInUser_ = container.loggedInUser
    } catch (e) {
      // avoid errors when backend first runs
    }
  }

  // List Apps Owned BY The Logged In User
  async list(selector: Selector<OAuth>): Promise<OAuth[]> {
    if(!this.loggedInUser_ || !this.loggedInUser_.organisation){
      throw new AutoflowAiError(
        AutoflowAiErrorTypes.NOT_FOUND,
        `User must belong to an "organisation" so as to get components`
      )
    }
    //Select only apps that belong to the logged in user's organisation
    const appRepo = this.activeManager_.withRepository(this.oauthRepository_)
    selector["organisation_id"] = this.loggedInUser_.organisation_id
    const query = buildQuery(selector, {})
    return await appRepo.find(query)
  }

  async create(app: CreateOAuthInput): Promise<OAuth> {

    if(!this.loggedInUser_ || !this.loggedInUser_.organisation){
      throw new AutoflowAiError(
        AutoflowAiErrorTypes.NOT_FOUND,
        `User must belong to an "organisation" must be defined so as to add a component`
      )
    }
    const oauthRepo = this.activeManager_.withRepository(this.oauthRepository_)
    const application = oauthRepo.create({organisation: this.loggedInUser_.organisation, ...app} )
    return await oauthRepo.save(application)
  }

  async generateToken(
    appName: string,
    code: string
  ): Promise<OAuth> {

    // Check If User Generating the Token Belongs To An Organisation
    if(!this.loggedInUser_ || !this.loggedInUser_.organisation){
      throw new AutoflowAiError(
        AutoflowAiErrorTypes.NOT_FOUND,
        `User must belong to an "organisation" so as to get components`
      )
    }

    const app:App = await this.appService_.retrieveByName(appName)
    
    if(!app){
      throw new AutoflowAiError(
        AutoflowAiErrorTypes.NOT_FOUND,
        `Application ${appName} not found`
      )
    }
    const service = this.container_[`${app.name}Oauth`]
    if (!service) {
      throw new AutoflowAiError(
        AutoflowAiErrorTypes.INVALID_DATA,
        `An OAuth handler for ${app.name} could not be found make sure the app is registered in the Ocular Core.`
      )
    }

    // if (!(app.data.state === state)) {
    //   throw new AutoflowAiError(
    //     AutoflowAiErrorTypes.NOT_ALLOWED,
    //     `${app.display_name} could not match state`
    //   )
    // }

    const data = await service.generateToken(code)

    // Create An OAuth For This App And Organisation
    return await this.create({
      data: data, organisation: this.loggedInUser_.organisation, app: app
    })
    .then(async (result) => {
      await this.eventBus_.emit(
        `${OAuthService.Events.TOKEN_GENERATED}.${appName}`,
        data
      )
      return result
    })
  }
}

export default OAuthService;