import Scrypt from "scrypt-kdf"
import { AuthenticateResult } from "../types/auth"
import { User } from "../models"
import { TransactionBaseService } from "../interfaces"
import UserService from "./user"
import { EntityManager } from "typeorm"

type InjectedDependencies = {
  manager: EntityManager
  userService: UserService
}

/**
 * Can authenticate a user based on email password combination
 */
class AuthService extends TransactionBaseService {
  protected readonly userService_: UserService

  constructor({ userService}: InjectedDependencies) {
    // eslint-disable-next-line prefer-rest-params
    super(arguments[0])

    this.userService_ = userService
  }

  /**
   * Verifies if a password is valid given the provided password hash
   * @param {string} password - the raw password to check
   * @param {string} hash - the hash to compare against
   * @return {bool} the result of the comparison
   */
  protected async comparePassword_(
    password: string,
    hash: string
  ): Promise<boolean> {
    const buf = Buffer.from(hash, "base64")
    return Scrypt.verify(buf, password)
  }

  /**
   * Authenticates a given user based on an email, password combination. Uses
   * scrypt to match password with hashed value.
   * @param {string} email - the email of the user
   * @param {string} password - the password of the user
   * @return {AuthenticateResult}
   *    success: whether authentication succeeded
   *    user: the user document if authentication succeeded
   *    error: a string with the error message
   */
  async authenticate(
    email: string,
    password: string
  ): Promise<AuthenticateResult> {
    return await this.atomicPhase_(async (transactionManager) => {
      try {
        const userPasswordHash: User = await this.userService_
          .withTransaction(transactionManager)
          .retrieveByEmail(email, {
            select: ["password_hash"],
          })

        const passwordsMatch = await this.comparePassword_(
          password,
          userPasswordHash.password_hash
        )

        if (passwordsMatch) {
          const user = await this.userService_
            .withTransaction(transactionManager)
            .retrieveByEmail(email)

          return {
            success: true,
            user: user,
          }
        }
      } catch (error) {
        console.log("error ->", error)
        // ignore
      }

      return {
        success: false,
        error: "Invalid email or password",
      }
    })
  }
}

export default AuthService