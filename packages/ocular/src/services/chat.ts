import { EntityManager} from "typeorm"
import { TransactionBaseService, ChatContext, ILLMInterface, IChatApproach, ChatResponse } from "@ocular/types"
import {Chat, Message, MessageRoles, User} from "../models"
import { ChatRepository, MessageRepository } from "../repositories"
import { CreateChatInput } from "../types/chat"
import { FindConfig, Selector } from "../types/common"
import { buildQuery } from "../utils/build-query"
import { AutoflowAiError } from "@ocular/utils"

type InjectedDependencies = {
  manager: EntityManager
  chatRepository: typeof ChatRepository
  chatRetrieveReadRetrieveApproache: IChatApproach
  openAiService: ILLMInterface
  messageRepository: typeof MessageRepository
  loggedInUser: User
}

class ChatService extends TransactionBaseService {
  protected readonly chatRepository_: typeof ChatRepository
  protected readonly chatApproach_: IChatApproach
  protected readonly openAiService_: ILLMInterface
  protected readonly messageRepository_: typeof MessageRepository
  protected readonly loggedInUser_: User

  constructor(container: InjectedDependencies) {
    // eslint-disable-next-line prefer-rest-params
    super(arguments[0])
    this.chatRepository_ =  container.chatRepository
    this.openAiService_ = container.openAiService
    this.chatApproach_ = container.chatRetrieveReadRetrieveApproache
    this.messageRepository_ = container.messageRepository
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

  async chat(chatId: string, message:string, context: ChatContext): Promise<ChatResponse> {
    return await this.atomicPhase_(
      async (transactionManager: EntityManager) => {
        const chatRepository = transactionManager.withRepository(
          this.chatRepository_
        )
        const chat = await chatRepository.findOne({
          where: {
            id: chatId,
            organisation_id: this.loggedInUser_.organisation_id,
            user_id: this.loggedInUser_.id
          },
          relations: ["messages"]
        });
        if (!chat) {
          throw new AutoflowAiError(
            AutoflowAiError.Types.NOT_FOUND,
            `Chat with id: ${chatId} was not found`
          )
        }
        const messageRepository = transactionManager.withRepository(
          this.messageRepository_
        )
        const userMessage = messageRepository.create({chat_id:chatId, user_id:this.loggedInUser_.id, content: message, role: MessageRoles.USER})
        await messageRepository.save(userMessage)
        let messages = chat?.messages.map(message => ({
          role: message.role,
          content: message.content
        }));
        messages.push({role: MessageRoles.USER, content: message})
        const chatResponse = await this.chatApproach_.run(messages, context)
        const assistantMessage = messageRepository.create({chat_id:chatId, user_id: this.loggedInUser_.id, content: chatResponse.message.content, role: MessageRoles.ASSISTANT})
        const savedAssistantMessage = await messageRepository.save(assistantMessage)
        return {
          message: savedAssistantMessage,
          data_points: chatResponse.data_points
        }
      }
    )
  }

  async list(selector, config = {}): Promise<Chat[]> {
    const chatRepo = this.activeManager_.withRepository(this.chatRepository_)
    selector.organisation_id = this.loggedInUser_.organisation_id
    selector.user_id = this.loggedInUser_.id
    return await chatRepo.find(buildQuery(selector, config))
  }
}

export default ChatService;