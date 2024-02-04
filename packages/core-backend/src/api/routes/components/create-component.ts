import {IsNotEmpty, IsString,IsEnum } from "class-validator"
import { ComponentService } from "../../../services"
import { validator } from "../../../utils/validator"
import { EntityManager } from "typeorm"
import { ComponentTypes } from "../../../models/component"

export default async (req, res) => {
  const validated = await validator(CreateComponentReq, req.body)


  const entityService: ComponentService = req.scope.resolve("componentService")

  const manager: EntityManager = req.scope.resolve("manager")
  await manager.transaction(async (transactionManager) => {
    return await entityService
      .withTransaction(transactionManager)
      .create(validated)
  })

  res.sendStatus(200)
}

export class CreateComponentReq {
  @IsEnum(ComponentTypes)
  @IsNotEmpty()
  type: ComponentTypes

  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  description?: string
}

