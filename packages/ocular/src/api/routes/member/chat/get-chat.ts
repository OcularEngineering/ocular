import ChatService from "../../../../services/chat"
import { FindParams } from "../../../../types/common"

export default async (req, res) => {
  const { id } = req.params

  const chatService: ChatService = req.scope.resolve("chatService")
  const chat= await chatService.retrieve(id, req.retrieveConfig)
  res.status(200).json({ chat })
}

export class GetChatParams extends FindParams {}