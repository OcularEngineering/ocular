import jwt, { JwtPayload } from "jsonwebtoken"
import { EntityManager } from "typeorm"
import { UserService } from "."
import { User } from "../models/user"
import { TransactionBaseService, UserRoles  } from "@ocular/types"
import { InviteRepository } from "../repositories/invite"
import { UserRepository } from "../repositories/user"
import { ConfigModule } from "../types/config-module"
import { ListInvite } from "../types/invite"
import { buildQuery } from "../utils/build-query"
import {IEventBusService} from "@ocular/types"
import { AutoflowAiError , AutoflowAiErrorTypes, AutoflowContainer } from "@ocular/utils"

// 7 days
const DEFAULT_VALID_DURATION = 1000 * 60 * 60 * 24 * 7


class InviteService extends TransactionBaseService {
  static Events = {
    CREATED: "invite.created",
  }

  protected readonly userService_: UserService
  protected readonly userRepo_: typeof UserRepository
  protected readonly inviteRepository_: typeof InviteRepository
  protected readonly eventBus_:  IEventBusService
  protected readonly loggedInUser_: User | null

  protected readonly configModule_: ConfigModule

  constructor(container,) {
    // @ts-ignore
    // eslint-disable-next-line prefer-rest-params
    super(...arguments)

    this.configModule_ = container.configModule
    this.userService_ = container.userService
    this.userRepo_ = container.userRepository
    this.inviteRepository_ = container.inviteRepository
    this.eventBus_ = container.eventBusService
    try {
      this.loggedInUser_ = container.loggedInUser
    } catch (e) {
      // avoid errors when backend first runs
    }
  }

  generateToken(data): string {
    const { jwt_secret } = this.configModule_.projectConfig
    if (jwt_secret) {
      return jwt.sign(data, jwt_secret)
    }
    throw new AutoflowAiError(
      AutoflowAiErrorTypes.INVALID_DATA,
      "Please configure jwt_secret"
    )
  }

  async list(selector, config = {}): Promise<ListInvite[]> {
    const inviteRepo = this.activeManager_.withRepository(InviteRepository)
    selector.organisation_id = this.loggedInUser_.organisation_id
    const query = buildQuery(selector, config)
    return await inviteRepo.find(query)
  }


  /**
   * Updates an account_user.
   * @param user - user emails
   * @param role - role to assign to the user
   * @param validDuration - role to assign to the user
   * @return the result of create
   */
  async create(
    user: string,
    role: UserRoles,
    validDuration = DEFAULT_VALID_DURATION
  ): Promise<void> {
    return await this.atomicPhase_(async (manager) => {
      const inviteRepository =
        this.activeManager_.withRepository(InviteRepository)

      const userRepo = this.activeManager_.withRepository(UserRepository)

      const userEntity = await userRepo.findOne({
        where: { email: user },
      })

      if (userEntity) {
        throw new AutoflowAiError(
          AutoflowAiError.Types.INVALID_DATA,
          "Can't invite a user with an existing account"
        )
      }

      let invite = await inviteRepository.findOne({
        where: { user_email: user },
      })
      // if user is trying to send another invite for the same account + email, but with a different role
      // then change the role on the invite as long as the invite has not been accepted yet
      if (invite && !invite.accepted) {
        throw new AutoflowAiError(
          AutoflowAiError.Types.INVALID_DATA,
          "Can't invite a user with a pending invite"
        )
      }
      
        // if no invite is found, create a new one
        const created = inviteRepository.create({
          role,
          token: "",
          user_email: user,
          organisation_id: this.loggedInUser_.organisation_id,
        })

        invite = await inviteRepository.save(created)
      

      invite.token = this.generateToken({
        invite_id: invite.id,
        role,
        user_email: user,
        organisation_id: invite.organisation_id,
      })

      invite.expires_at = new Date()
      invite.expires_at.setMilliseconds(
        invite.expires_at.getMilliseconds() + validDuration
      )

      invite = await inviteRepository.save(invite)

      const inviteLink = `${this.configModule_.projectConfig.ui_cors}/invite/accept?token=${invite.token}`

      await this.eventBus_
        .withTransaction(manager)
        .emit(InviteService.Events.CREATED, {
          id: invite.id,
          invite_link: inviteLink,
          organisation_name: this.loggedInUser_.organisation.name,
          user_email: invite.user_email,
        })
    })
  }

  async accept(token, user_): Promise<User> {
    let decoded
    try {
      decoded = this.verifyToken(token)
    } catch (err) {
      throw new AutoflowAiError(
        AutoflowAiError.Types.INVALID_DATA,
        "Token is not valid"
      )
    }

    const { invite_id, user_email } = decoded

    return await this.atomicPhase_(async (m) => {
      const userRepo = m.withRepository(this.userRepo_)
      const inviteRepo: typeof InviteRepository = m.withRepository(
        this.inviteRepository_
      )

      const invite = await inviteRepo.findOne({ where: { id: invite_id }, relations: ["organisation"] })

      if (
        !invite ||
        invite?.user_email !== user_email ||
        new Date() > invite.expires_at
      ) {
        throw new AutoflowAiError(AutoflowAiError.Types.INVALID_DATA, `Invalid invite`)
      }

      const exists = await userRepo.findOne({
        where: { email: user_email.toLowerCase() },
        select: ["id"],
      })

      if (exists) {
        throw new AutoflowAiError(
          AutoflowAiError.Types.INVALID_DATA,
          "User already joined"
        )
      }

      // use the email of the user who actually accepted the invite
      const user = await this.userService_.withTransaction(m).createInvitedUser(
        {
          email: invite.user_email,
          role: invite.role,
          first_name: user_.first_name,
          last_name: user_.last_name,
          organisation: invite.organisation,
        },
        user_.password
      )

      await inviteRepo.delete({ id: invite.id })

      return user
    }, "SERIALIZABLE")
  }


  verifyToken(token): JwtPayload | string {
    const { jwt_secret } = this.configModule_.projectConfig
    if (jwt_secret) {
      return jwt.verify(token, jwt_secret)
    }
    throw new AutoflowAiError(
      AutoflowAiErrorTypes.INVALID_DATA,
      "Please configure jwt_secret"
    )
  }
}

export default InviteService