import { EntityManager} from "typeorm"
import { TransactionBaseService } from "@ocular/types"
import {Chat, User} from "../models"
import { ChatRepository } from "../repositories"
import { CreateChatInput } from "../types/chat"
import { FindConfig, Selector } from "../types/common"
import { buildQuery } from "../utils/build-query"
import { AutoflowAiError } from "@ocular/utils"

type InjectedDependencies = {
  manager: EntityManager
  chatRepository: typeof ChatRepository
  loggedInUser: User
}

class ChatService extends TransactionBaseService {
  protected readonly chatRepository_: typeof ChatRepository
  protected readonly loggedInUser_: User

  constructor(container: InjectedDependencies) {
    // eslint-disable-next-line prefer-rest-params
    super(arguments[0])
    this.chatRepository_ =  container.chatRepository
    this.loggedInUser_ = container.loggedInUser
  }


  async create(chat: CreateChatInput): Promise<Chat> {
    return await this.atomicPhase_(
      async (transactionManager: EntityManager) => {
        const chatRepository = transactionManager.withRepository(
          this.chatRepository_
        )
        const createdChat = chatRepository.create({...chat, organisation_id: this.loggedInUser_.organisation_id, user_id: this.loggedInUser_.id})
        const newChat = await chatRepository.save(createdChat)
        return newChat
      }
    )
  }

  async retrieve(chatId: string , config: FindConfig<Chat> = {}): Promise<Chat> {

    console.log("Retrieve ChatId",chatId)
    if (!chatId) {
      throw new AutoflowAiError(
        AutoflowAiError.Types.NOT_FOUND,
        `ChatId is not definded`
      )
    }
    const chatRepo = this.activeManager_.withRepository(this.chatRepository_)

    const query = buildQuery({ id: chatId, organisation_id:this.loggedInUser_.organisation_id, user_id: this.loggedInUser_.id }, config)

    const chat = await chatRepo.findOne(query)

    if (!chat) {
      throw new AutoflowAiError(
        AutoflowAiError.Types.NOT_FOUND,
        `Chat with id: ${chatId} was not found`
      )
    }

    return chat
  }


  async list(selector, config = {}): Promise<Chat[]> {
    const chatRepo = this.activeManager_.withRepository(this.chatRepository_)
    selector.organisation_id = this.loggedInUser_.organisation_id
    selector.user_id = this.loggedInUser_.id
    return await chatRepo.find(buildQuery(selector, config))
  }
}
export default ChatService;