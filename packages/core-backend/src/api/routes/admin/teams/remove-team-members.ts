import { Request, Response } from "express"
import { IsObject,  IsArray, IsOptional, IsString,IsEmail,ValidateNested} from "class-validator"

import { TeamService} from "../../../../services"
import { EntityManager } from "typeorm"
import { Type } from "class-transformer"
import { validator } from "../../../../utils/validator"

/**
 * @oas [delete] /admin/teams/{id}/members
 * summary: "Add Teams to A Group"
 * description: "Add a list of members to a team."
 */

export default async (req: Request, res: Response) => {
  const { id } = req.params
  const validated = await validator(
    DeleteTeamMembersReq,
    req.body
  )

  const teamService: TeamService = req.scope.resolve(
    "teamService"
  )

  const manager: EntityManager = req.scope.resolve("manager")
  const customer_group = await manager.transaction(
    async (transactionManager) => {
      return await  teamService
        .withTransaction(transactionManager)
        .removeMembers(
          id,
          validated.member_emails
        )
    }
  )

  res.status(200).json({ customer_group })
}

export class DeleteTeamMembersReq {
  @IsArray()
  member_emails: string[]
}