import { EntityManager} from "typeorm"
import { TransactionBaseService } from "@ocular/types"
import {Chat, Message, User} from "../models"
import { MessageRepository } from "../repositories"
import { CreateChatInput } from "../types/chat"
import { FindConfig, Selector } from "../types/common"
import { buildQuery } from "../utils/build-query"
import { AutoflowAiError } from "@ocular/utils"
import {CreateMessageInput} from "../types"
import ChatService from "./chat"

type InjectedDependencies = {
  chatService: ChatService
  manager: EntityManager
  messageRepository: typeof MessageRepository
  loggedInUser: User
}

class MessageService extends TransactionBaseService {
  protected readonly messageRepository_: typeof MessageRepository
  protected readonly loggedInUser_: User
  protected readonly chatService_: ChatService

  constructor(container: InjectedDependencies) {
    // eslint-disable-next-line prefer-rest-params
    super(arguments[0])
    this.chatService_ = container.chatService
    this.messageRepository_ =  container.messageRepository
    this.loggedInUser_ = container.loggedInUser
  }


  async create(message: CreateMessageInput): Promise<Message> {
    console.log(message)
    return await this.atomicPhase_(
      async (transactionManager: EntityManager) => {
        const messageRepository = transactionManager.withRepository(
          this.messageRepository_
        )
        const chat = await this.chatService_.retrieve(message.chat_id)
        if (!chat) {
          throw new AutoflowAiError(
            AutoflowAiError.Types.NOT_FOUND,
            `MessageService: Failed to create message for : ${message.chat_id} was not found`
          )
        }

        const createdMessage = messageRepository.create({...message, user_id: this.loggedInUser_.id, chat_id:chat.id})
        return await messageRepository.save(createdMessage)
      }
    )
  }
}
export default MessageService;