import  ChatService from "../../../../services/chat"

export default async (req, res) => {
  const chatService: ChatService = req.scope.resolve("chatService")
  const chats = await chatService.list({})
  res.status(200).json({ chats })
}