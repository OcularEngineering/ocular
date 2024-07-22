import { IsString, IsNotEmpty, IsBoolean } from "class-validator"
import { validator } from "@ocular/utils"
import { ChatService } from "../../../../services"

export default async (req, res) => {
  const { id } = req.params
  const validated = await validator(PostMessageReq, req.body)
  try {
    const { message } = validated;
    const chatService = req.scope.resolve("chatService") as ChatService
    const chatResponse = await chatService.chatWithStreaming(id, message, {})
    for await (const chunk of chatResponse) {
      res.write(JSON.stringify(chunk) + "\n");
    }
    res.status(200);
    res.end();
  } catch (_error: unknown) {
    console.error(_error)
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