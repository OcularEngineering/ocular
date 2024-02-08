import { IsEmail, IsEnum } from "class-validator"

import InviteService from "../../../services/invite"
import { UserRoles } from "../../../models/user"
import { validator } from "../../../utils/validator"
import { EntityManager } from "typeorm"

export default async (req, res) => {
  const validated = await validator(AdminPostInvitesReq, req.body)

  const inviteService: InviteService = req.scope.resolve("inviteService")

  const manager: EntityManager = req.scope.resolve("manager")
  await manager.transaction(async (transactionManager) => {
    return await inviteService
      .withTransaction(transactionManager)
      .create(validated.user, validated.role)
  })

  res.sendStatus(200)
}

/**
 * @schema AdminPostInvitesReq
 * type: object
 * required:
 *   - user
 *   - role
 * properties:
 *   user:
 *     description: "The email associated with the invite. Once the invite is accepted, the email will be associated with the created user."
 *     type: string
 *     format: email
 *   role:
 *     description: "The role of the user to be created. This does not actually change the privileges of the user that is eventually created."
 *     type: string
 *     enum: [admin, member, developer]
 */
export class AdminPostInvitesReq {
  @IsEmail()
  user: string

  @IsEnum(UserRoles)
  role: UserRoles
}