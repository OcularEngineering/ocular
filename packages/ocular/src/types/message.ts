import { MessageRoles } from "../models/message"

export interface CreateMessageInput{
  role: MessageRoles
  content: string
  chat_id: string
}
