import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator"
import _ from "lodash"
import InviteService from "../../../../services/invite"
import { Type } from "class-transformer"
import { validator } from "../../../../utils/validator"
import { EntityManager } from "typeorm"
import { AuthService } from "../../../../services"

/**
 * @oas [post] /admin/invites/accept
 * operationId: "PostInvitesInviteAccept"
 * summary: "Accept an Invite"
 * description: "Accept an Invite. This will also delete the invite and create a new user that can log in and perform functionalities. The user will have the email associated with the invite, and the password
 *  provided in the request body."
 */
export default async (req, res) => {
  const validated = await validator(InviteAcceptReq, req.body)

  const inviteService: InviteService = req.scope.resolve("inviteService")
  const authService: AuthService = req.scope.resolve("authService")

  const manager: EntityManager = req.scope.resolve("manager")
  await manager.transaction(async (transactionManager) => {
   await inviteService
      .withTransaction(transactionManager)
      .accept(validated.token, validated.user)
      .then((user) => {
        authService
        .withTransaction(transactionManager)
        .authenticate(user.email, validated.user.password)
        .then((result) => {
          if (result.success && result.user) {
            req.session.user = { user_id: result.user.id, user_role: result.user.role }
            const cleanRes = _.omit(result.user, ["password_hash"])
            res.json({ user: result.user })
          }else{
            res.sendStatus(401)
          }
        })
      }).catch((error) => {
        console.log("error ->", error)
        res.sendStatus(401)
      })
  })
}

/**
 * Details of the use accepting the invite.
 */
export class InviteAcceptUserReq {
  /**
   * The invite's first name.
   */
  @IsString()
  @IsOptional()
  first_name: string

  /**
   * The invite's last name.
   */
  @IsString()
  @IsOptional()
  last_name: string

  /**
   * The invite's password
   */
  @IsString()
  password: string
}

/**
 * @schema AdminPostInvitesInviteAcceptReq
 * type: object
 * description: "The details of the invite to be accepted."
 * required:
 *   - token
 *   - user
 * properties:
 *   token:
 *     description: "The token of the invite to accept. This is a unique token generated when the invite was created or resent."
 *     type: string
 *   user:
 *     description: "The details of the user to create."
 *     type: object
 *     required:
 *       - first_name
 *       - last_name
 *       - password
 *     properties:
 *       first_name:
 *         type: string
 *         description: the first name of the User
 *       last_name:
 *         type: string
 *         description: the last name of the User
 *       password:
 *         description: The password for the User
 *         type: string
 *         format: password
 */
export class InviteAcceptReq {
  @IsString()
  @IsNotEmpty()
  token: string

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => InviteAcceptUserReq)
  user: InviteAcceptUserReq
}