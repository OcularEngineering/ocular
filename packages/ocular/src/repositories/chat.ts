import { Chat } from "../models"
import { dataSource } from "../loaders/database"

export const ChatRepository = dataSource.getRepository(Chat)
export default ChatRepository