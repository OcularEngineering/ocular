import { IsObject,  IsArray, IsOptional, IsString,IsEmail,ValidateNested} from "class-validator"
import { Request, Response } from "express"
import { validator } from "../../../utils/validator"
import TeamService from "../../../services/team"
import { Type } from "class-transformer"
import { EntityManager } from "typeorm"

export default async (req: Request, res: Response) => {
  const validated = await validator(PostTeamReq, req.body)

  const teamService: TeamService = req.scope.resolve(
    "teamService"
  )

  const manager: EntityManager = req.scope.resolve("manager")
  const team = await manager.transaction(
    async (transactionManager) => {
      return await teamService
        .withTransaction(transactionManager)
        .create(validated)
    }
  )

  res.status(200).json({ team: team })
}

export class PostTeamReq {
  @IsString()
  name: string

  @IsArray()
  member_emails: string[]
}
