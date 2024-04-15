import { IsString, IsNotEmpty } from "class-validator"
import { EntityManager } from "typeorm"
import { validator } from "@ocular/utils"
import ChatService from "../../../../services/chat"

export default async (req, res) => {
  const validated = await validator(CreateChatReq, req.body)

  const chatService: ChatService = req.scope.resolve("chatService")
  const manager: EntityManager = req.scope.resolve("manager")
  
  const chat =  await manager.transaction(async (transactionManager) => {
    return await chatService
      .withTransaction(transactionManager)
      .create(validated)
  })
  res.status(200).json({ chat })
}

export class CreateChatReq {
  @IsString()
  @IsNotEmpty()
  name: string
}
