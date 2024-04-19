import { Message } from "../models"
import { dataSource } from "../loaders/database"

export const MessageRepository = dataSource.getRepository(Message)
export default MessageRepository