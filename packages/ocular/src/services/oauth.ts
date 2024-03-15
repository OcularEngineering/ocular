import { EntityManager } from "typeorm"
import { AppNameDefinitions, TransactionBaseService } from "@ocular/types"
import EventBusService from "./event-bus"
import { AutoflowContainer } from "@ocular/types"
import { AutoflowAiError,AutoflowAiErrorTypes } from "@ocular/utils"
import { App, User } from "../models"
import { buildQuery } from "../utils/build-query"
import { CreateOAuthInput, RetrieveOAuthConfig, UpdateOAuthInput } from "../types/oauth"
import  {OAuth} from "../models"
import AppService from "./app"
import OAuthRepository from "../repositories/oauth"
import { Selector } from "../types/common"
import { OAuthToken } from "@ocular/types"


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

  // Expose this to Internal Services Only
  // Hack To Expose This Credientals To Indexing Apps
  async retrieve(retrieveConfig: RetrieveOAuthConfig): Promise<OAuth> {
    const oauthRepo = this.activeManager_.withRepository(this.oauthRepository_)
    const oauth = await oauthRepo.findOne({
      where: { organisation_id:retrieveConfig.id, app_name: retrieveConfig.app_name }
    })
    return oauth
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
        `User must belong to an "organisation" must be defined to create an OAuth`
      )
    }
    const oauthRepo = this.activeManager_.withRepository(this.oauthRepository_)
    const application = oauthRepo.create({organisation: this.loggedInUser_.organisation, ...app} )
    return await oauthRepo.save(application)
  }

  async generateToken(
    name: string,
    code: string
  ): Promise<OAuth> {

    // Check If The User Generating the Token Belongs To An Organisation
    if(!this.loggedInUser_ || !this.loggedInUser_.organisation){
      throw new AutoflowAiError(
        AutoflowAiErrorTypes.NOT_FOUND,
        `User must belong to an "organisation" so as to add OAuth`
      )
    }

    const app:App = await this.appService_.retrieveByName(name)
    
    if(!app){
      throw new AutoflowAiError(
        AutoflowAiErrorTypes.NOT_FOUND,
        `Application ${name} not found`
      )
    }

 

    const service = this.container_[`${app.name}Oauth`]
    if (!service) {
      throw new AutoflowAiError(
        AutoflowAiErrorTypes.INVALID_DATA,
        `An OAuth handler for ${app.name} could not be found make sure the app is registered in the Ocular Core.`
      )
    }

    const token: OAuthToken = await service.generateToken(code)

    console.log("TOKEN GENERATED", token)

    const oauth = this.oauthRepository_.find({
      where: {
        organisation_id: this.loggedInUser_.organisation_id,
        app_name: app.name
      }
    });

    if(oauth){
      await this.oauthRepository_.delete({
        organisation_id: this.loggedInUser_.organisation_id,
        app_name: app.name
      })
    }

    // Create An OAuth For This App And Organisation
    return await this.create({
      type: token.type, 
      token: token.token, 
      token_expires_at: token.token_expires_at, 
      refresh_token: token.refresh_token, 
      refresh_token_expires_at: token.refresh_token_expires_at,  
      organisation: this.loggedInUser_.organisation, app_name: app.name
    })
    .then(async (result) => {
      await this.eventBus_.emit(
        `${OAuthService.Events.TOKEN_GENERATED}.${app.name}`,{
          organisation: this.loggedInUser_.organisation,
          token: token
        }
      )
      return result
    })
    return null
  }

  async update(id: string, update: UpdateOAuthInput): Promise<OAuth> {
    const repo = this.activeManager_.withRepository(this.oauthRepository_)

    const oauth = await this.oauthRepository_.findOne({
      where: {
        id: id
      }
    });

    const { last_sync, token, token_expires_at, refresh_token, refresh_token_expires_at  } = update

    if (last_sync) {
      oauth.last_sync =  last_sync
    }
    if (token) {
      oauth.token = token
    }
    if (token_expires_at) {
      oauth.token_expires_at = token_expires_at
    }
    if (refresh_token) {
      oauth.refresh_token = refresh_token
    }
    if (refresh_token_expires_at) {
      oauth.refresh_token_expires_at = refresh_token_expires_at
    }

    return await repo.save(oauth)
  }
}

export default OAuthService;