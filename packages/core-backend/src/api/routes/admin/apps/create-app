import {IsNotEmpty, IsString,IsEnum } from "class-validator"
import { AppService } from "../../../services"
import { validator } from "../../../utils/validator"
import { EntityManager } from "typeorm"
import { ComponentTypes } from "../../../models/component"

export default async (req, res) => {
  const validated = await validator(CreateAppReq, req.body)

  const appService: AppService = req.scope.resolve("appService")

  const manager: EntityManager = req.scope.resolve("manager")
  await manager.transaction(async (transactionManager) => {
    return await appService
      .withTransaction(transactionManager)
      .create(validated)
  })
  res.sendStatus(200)
}

export class CreateAppReq {
  @IsEnum(ComponentTypes)
  @IsNotEmpty()
  type: ComponentTypes

  @IsString()
  @IsNotEmpty()
  identifier: string

  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  install_url: string

  @IsString()
  @IsNotEmpty()
  uninstall_url: string
}

