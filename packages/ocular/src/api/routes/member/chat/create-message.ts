import { IsString, IsNotEmpty, IsBoolean } from "class-validator"
import { validator } from "@ocular/utils"
import { ChatService } from "../../../../services"
// import {ChatContext} from "@ocular/types";

export default async (req, res) => {
  const { id } = req.params
  const validated = await validator(PostMessageReq, req.body)
  try {
    const { message, context } = validated;
    const chatService = req.scope.resolve("chatService") as ChatService
    const assistantMessage = await chatService.chat(id, message, context)
    return res.status(200).send({message : assistantMessage})

  } catch (_error: unknown) {
    return res.status(500).send("Error: Failed to execute Chat");
  }
}

export class PostMessageReq {
  @IsString()
  @IsNotEmpty()
  message: string

  @IsBoolean()
  stream: Boolean
}