import { IsString, IsNotEmpty, IsEnum, IsBoolean } from "class-validator"
import { EntityManager } from "typeorm"
import MessageService from "../../../../services/message"
import { Message, MessageRoles } from "../../../../models"

import { SearchService, UserService } from "../../../../services"
import { Type } from "class-transformer"
import { validator } from "@ocular/utils"
import { AbstractLLMService, ApproachDefinitions, ILLMInterface, SearchContext} from "@ocular/types";
import { MessageBuilder } from "../../../../utils/message"


export default async (req, res) => {
  const { id } = req.params
  const validated = await validator(PostMessageReq, req.body)
  try {
    const loggedInUser = req.scope.resolve("loggedInUser")
    const { message, stream } = validated;
    const messageService = req.scope.resolve("messageService") as MessageService
    messageService.create({chat_id:id,content: message, role: MessageRoles.USER})
    
    const openaiService = req.scope.resolve("openAiService") as ILLMInterface
    const generatedText = await openaiService.completeChat([{content:message, role: MessageRoles.USER}])

    const responseMessage = await messageService.create({chat_id:id,content: generatedText, role: MessageRoles.ASSISTANT})
    return res.status(200).send({message:responseMessage})
  } catch (_error: unknown) {
    const error = _error as Error & { error?: any; status?: number };
    console.log(error)
    if (error.error) {
      return res.status(error.status ?? 500).send("Error: Failed to execute Chat");
    }
    return res.status(500).send("Error: Failed to execute Chat");
  }
  return res.status(500).send(`Error: Failed to execute Chat.`);
}

export class PostMessageReq {
  @IsString()
  @IsNotEmpty()
  message: string

  @IsBoolean()
  stream: Boolean
}