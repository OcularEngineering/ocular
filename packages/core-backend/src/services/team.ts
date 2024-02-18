import { TransactionBaseService } from "@ocular-ai/types";
import { Team, User } from "../models";
import TeamRepository from "../repositories/team";
import UserService from "./user";
import { DeepPartial, FindOptionsWhere, ILike} from "typeorm";
import { AutoflowAiError } from "@ocular-ai/utils";
import { CreateTeamInput } from "../types/team";
import { buildQuery } from "../utils/build-query";
import { FindConfig, Selector } from "../types/common";
import { isString } from "../utils";
import { isDefined } from "../utils/is-defined";
import { Logger } from "../types/global";

type InjectedDependencies = {
  teamRepository: typeof TeamRepository
  userService: UserService
  loggedInUser: User
  logger:Logger
}

class TeamService extends TransactionBaseService {
  private readonly teamRepository_: typeof TeamRepository
  private readonly userService_: UserService
  private readonly loggedInUser_: User
  private readonly logger_: Logger

  constructor({ teamRepository, userService, loggedInUser, logger }: InjectedDependencies) {
    // eslint-disable-next-line prefer-rest-params
    super(arguments[0])
    this.teamRepository_ = teamRepository
    this.userService_ = userService
    this.loggedInUser_ = loggedInUser
    this.logger_ = logger
  }

  async retrieve(teamId: string, config = {}): Promise<Team> {
    if (!isDefined(teamId)) {
      throw new AutoflowAiError(
        AutoflowAiError.Types.NOT_FOUND,
        `"teamId" must be defined`
      )
    }

    const cgRepo = this.activeManager_.withRepository(
      this.teamRepository_
    )

    const query = buildQuery({ id: teamId, organisation_id:this.loggedInUser_.organisation_id }, config)

    const customerGroup = await cgRepo.findOne(query)
    if (!customerGroup) {
      throw new AutoflowAiError(
        AutoflowAiError.Types.NOT_FOUND,
        `Team with id ${teamId} was not found`
      )
    }
    return customerGroup
  }

/**
 * Creates a team and user to the team.
 * @param team - the team to create
 * @return the result of the create operation
 */
  async create(team: CreateTeamInput): Promise<Team> {
    return await this.atomicPhase_(async (manager) => {
        const teamRepo: typeof TeamRepository = manager.withRepository(
          this.teamRepository_
        )
        const created = await teamRepo.create({name: team.name, organisation:this.loggedInUser_.organisation})
        created.members = []
        for(const email of team.member_emails){
          await this.userService_.retrieveByEmail(email)
          .then((user)=>{
            if(user && user.organisation_id === this.loggedInUser_.organisation_id){
              created.members.push(user)
            }
          })
          .catch((err) => { 
            this.logger_.error(`User with email: ${email} was not found for ${this.loggedInUser_.organisation.id} team with ${err}.`)
          })
        }
        const createdTeam = await teamRepo.save(created)
        return await teamRepo.save(createdTeam)
    })
  }

  async addMembers( team_id: string, member_emails: string[]){
    return await this.atomicPhase_(async (manager) => {
      const teamRepo: typeof TeamRepository = manager.withRepository(
        this.teamRepository_
      )
      const team = await teamRepo.findOne({ where: { id: team_id, organisation_id:this.loggedInUser_.organisation_id }, relations: ['members'] })

      if(!team){
        throw new AutoflowAiError(
          AutoflowAiError.Types.NOT_FOUND,
          `Team with id ${team_id} not found`
        )
      }

      for(const email of member_emails){
        await this.userService_.retrieveByEmail(email)
        .then((user)=>{
          
          if(user && user.organisation_id === this.loggedInUser_.organisation_id){
            team.members.push(user)
          }
        })
        .catch((err) => { 
          this.logger_.error(`User with email: ${email} was not found for ${this.loggedInUser_.organisation.id} team with err ${err}.`)
        })
      }
      return await teamRepo.save(team)
    })
  }

  async removeMembers( team_id: string, member_emails: string[]){
    return await this.atomicPhase_(async (manager) => {
      const teamRepo: typeof TeamRepository = manager.withRepository(
        this.teamRepository_
      )
      const team = await teamRepo.findOne({ where: { id: team_id, organisation_id:this.loggedInUser_.organisation_id }, relations: ['members'] })

      if(!team){
        throw new AutoflowAiError(
          AutoflowAiError.Types.NOT_FOUND,
          `Team with id ${team_id} not found`
        )
      }
      team.members = team.members.filter((member) => !member_emails.includes(member.email))
      return await teamRepo.save(team)
    })
  }

  async list(
    selector: Selector<Team> & {
      q?: string
      discount_condition_id?: string
    } = {},
    config: FindConfig<Team>
  ): Promise<Team[]> {
    const [teams] = await this.listAndCount(selector, config)
    return teams
  }
  
/**
   * Retrieve a list of teams and total count of records that match the query.
   *
   * @param selector - the query object for find
   * @param config - the config to be used for find
   * @return the result of the find operation
   */
  async listAndCount(
    selector: Selector<Team> & { q?: string},
    config: FindConfig<Team>
  ): Promise<[Team[], number]> {
    const teamRepo = this.activeManager_.withRepository(
      this.teamRepository_
    )

    let q
    if (isString(selector.q)) {
      q = selector.q
      delete selector.q
    }
    
    const query = buildQuery<Selector<Team>, any>(selector, config)
    query.where = query.where as FindOptionsWhere<Team>
    query.where.organisation_id = this.loggedInUser_.organisation_id

    if (q) {
      query.where.name = ILike(`%${q}%`)
    }

    return await teamRepo.findAndCount(query)
  }

 
async delete(teamId: string): Promise<void> {
  return await this.atomicPhase_(async (manager) => {
    const teamRepo: typeof TeamRepository = manager.withRepository(
      this.teamRepository_
    )

    const teamGroup = await teamRepo.findOne({ where: { id: teamId, organisation_id:this.loggedInUser_.organisation_id } })

    if (teamGroup) {
      await teamRepo.remove(teamGroup)
    }

    return Promise.resolve()
  })
}

}

export default TeamService