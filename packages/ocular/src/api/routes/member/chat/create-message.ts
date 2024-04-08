import { IsString, IsNotEmpty, IsEnum } from "class-validator"
import { EntityManager } from "typeorm"
import { validator } from "@ocular/utils"
import MessageService from "../../../../services/message"
import { MessageRoles } from "../../../../models"

export default async (req, res) => {
  const { id } = req.params

  const validated = await validator(CreateMessageReq, req.body)

  const messageService: MessageService = req.scope.resolve("messageService")
  const manager: EntityManager = req.scope.resolve("manager")
  
  const message =  await manager.transaction(async (transactionManager) => {
    return await messageService
      .withTransaction(transactionManager)
      .create({...validated, role: MessageRoles.USER, chat_id: id})
  })
  res.status(200).json({ message })
}

export class CreateMessageReq {
  @IsString()
  @IsNotEmpty()
  content: string
}
