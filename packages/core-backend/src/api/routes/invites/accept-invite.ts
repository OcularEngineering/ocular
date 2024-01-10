import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator"

import InviteService from "../../../services/invite"
import { Type } from "class-transformer"
import { validator } from "../../../utils/validator"
import { EntityManager } from "typeorm"

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

  const manager: EntityManager = req.scope.resolve("manager")
  await manager.transaction(async (transactionManager) => {
    return await inviteService
      .withTransaction(transactionManager)
      .accept(validated.token, validated.user)
  })

  res.sendStatus(200)
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