import AutoflowAiError from "../utils/error"
import Scrypt from "scrypt-kdf"
import { EntityManager } from "typeorm"
import { TransactionBaseService } from "../interfaces"
import { User } from "../models"
import { UserRepository } from "../repositories/user"
import {
    CreateUserInput,
} from "../types/user"
import { validateEmail } from "../utils/is-email"
import {buildQuery} from "../utils/build-query"
import { FindConfig } from "../types/common"
import OrganisationService from "./organisation"
import { CreateOrganisationInput } from "../types/organisation"
import { isDefined } from "../utils/is-defined"



type UserServiceProps = {
  userRepository: typeof UserRepository
  organisationService: OrganisationService
  manager: EntityManager
}

/**
 * Provides layer to manipulate users.
 */
class UserService extends TransactionBaseService {
  static Events = {
    PASSWORD_RESET: "user.password_reset",
    CREATED: "user.created",
    UPDATED: "user.updated",
    DELETED: "user.deleted",
  }

  protected readonly userRepository_: typeof UserRepository
  protected readonly organisationService_: OrganisationService
  constructor({
    userRepository,
    organisationService
  }: UserServiceProps) {
    // eslint-disable-next-line prefer-rest-params
    super(arguments[0])
    this.userRepository_ = userRepository
    this.organisationService_ = organisationService
  }

  // /**
  //  * @param {FilterableUserProps} selector - the query object for find
  //  * @param {Object} config - the configuration object for the query
  //  * @return {Promise} the result of the find operation
  //  */
  // async list(selector: FilterableUserProps, config = {}): Promise<User[]> {
  //   const userRepo = this.activeManager_.withRepository(this.userRepository_)
  //   return await userRepo.find(buildQuery(selector, config))
  // }

  /**
   * Gets a user by id.
   * Throws in case of DB Error and if user was not found.
   * @param {string} userId - the id of the user to get.
   * @param {FindConfig} config - query configs
   * @return {Promise<User>} the user document.
   */
  async retrieve(userId: string, config: FindConfig<User> = {}): Promise<User> {
    if (!isDefined(userId)) {
      throw new AutoflowAiError(
        AutoflowAiError.Types.NOT_FOUND,
        `"userId" must be defined`
      )
    }

    const userRepo = this.activeManager_.withRepository(this.userRepository_)
    const query = buildQuery({ id: userId }, config)

    const users = await userRepo.find(query)

    if (!users.length) {
      throw new AutoflowAiError(
        AutoflowAiError.Types.NOT_FOUND,
        `User with id: ${userId} was not found`
      )
    }

    return users[0]
  }

  /**
   * Gets a user by email.
   * Throws in case of DB Error and if user was not found.
   * @param {string} email - the email of the user to get.
   * @param {FindConfig} config - query config
   * @return {Promise<User>} the user document.
   */
  async retrieveByEmail(
    email: string,
    config: FindConfig<User> = {}
  ): Promise<User> {
    const userRepo = this.activeManager_.withRepository(this.userRepository_)

    const query = buildQuery({ email: email.toLowerCase() }, config)
    const user = await userRepo.findOne(query)

    if (!user) {
      throw new AutoflowAiError(
        AutoflowAiError.Types.NOT_FOUND,
        `User with email: ${email} was not found`
      )
    }

    return user
  }

  /**
   * Hashes a password
   * @param {string} password - the value to hash
   * @return {string} hashed password
   */
  async hashPassword_(password: string): Promise<string> {
    const buf = await Scrypt.kdf(password, { logN: 1, r: 1, p: 1 })
    return buf.toString("base64")
  }

  /**
   * Creates a user with username being validated. User will have an organisation associated to them and will be the admin.
   * Fails if email is not a valid format.
   * @param {object} user - the user to create
   * @param {string} password - user's password to hash
   * @return {Promise} the result of create
   */
  // Notes
  // User is the admin
  // User has organisation associated with them.
  // Information passed should have organisation info.
  async create(user: CreateUserInput, password: string): Promise<User> {
    console.log("Creating User", user)

    
    return await this.atomicPhase_(async (manager: EntityManager) => {
      const userRepo = manager.withRepository(this.userRepository_)

      const createUserData = { ...user } as CreateUserInput & {
        password_hash: string
      }

      const validatedEmail = validateEmail(user.email)

      const userEntity = await userRepo.findOne({
        where: { email: validatedEmail },
      })

      if (userEntity) {
        throw new AutoflowAiError(
          AutoflowAiError.Types.INVALID_DATA,
          "A user with the same email already exists."
        )
      }

      if (password) {
        const hashedPassword = await this.hashPassword_(password)
        createUserData.password_hash = hashedPassword
      }
      
      // Create Organisation
      const createOrganisatonData = { ...user.organisation} as CreateOrganisationInput
      const organisationService = this.organisationService_.withTransaction(manager)
      const organisation = await organisationService.create(createOrganisatonData)

      // Create User
      createUserData.email = validatedEmail
      const created = userRepo.create(createUserData)
      created.organisation = organisation
      const newUser = await userRepo.save(created)

      return created
    })
  }

  // /**
  //  * Updates a user.
  //  * @param {object} userId - id of the user to update
  //  * @param {object} update - the values to be updated on the user
  //  * @return {Promise} the result of create
  //  */
  // async update(userId: string, update: UpdateUserInput): Promise<User> {
  //   return await this.atomicPhase_(async (manager: EntityManager) => {
  //     const userRepo = manager.withRepository(this.userRepository_)

  //     const user = await this.retrieve(userId)

  //     const { email, password_hash, metadata, ...rest } = update

  //     if (email) {
  //       throw new MedusaError(
  //         MedusaError.Types.INVALID_DATA,
  //         "You are not allowed to update email"
  //       )
  //     }

  //     if (password_hash) {
  //       throw new MedusaError(
  //         MedusaError.Types.INVALID_DATA,
  //         "Use dedicated methods, `setPassword`, `generateResetPasswordToken` for password operations"
  //       )
  //     }

  //     if (metadata) {
  //       user.metadata = setMetadata(user, metadata)
  //     }

  //     for (const [key, value] of Object.entries(rest)) {
  //       user[key] = value
  //     }

  //     const updatedUser = await userRepo.save(user)

  //     return updatedUser
  //   })
  // }
}

export default UserService