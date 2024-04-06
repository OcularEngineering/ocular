import { IsIn, ValidateNested, IsNumber, IsOptional, IsString, IsArray, IsBoolean, IsNotEmpty,IsEnum } from "class-validator"
import { SearchService, UserService } from "../../../../services"
import { Type } from "class-transformer"
import { validator } from "@ocular/utils"
import { ApproachDefinitions, SearchContext} from "@ocular/types";


export default async (req, res) => {

  const validated = await validator(PostChatReq, req.body)
  const { approach } = validated ?? {};

  // const askApproach = fastify.approaches.ask[approach ?? 'rtr'];
  try {
    const loggedInUser = req.scope.resolve("loggedInUser")
    const { q, messages, context, stream } = req.body;

    if (approach === ApproachDefinitions.CHAT_RETRIEVE_READ) {
      console.log(req.scope.registrations)
      const chatApproach = req.scope.resolve("chatRetrieveReadRetrieveApproache")
      const results = await chatApproach.run( messages, (context as any) ?? {});
      return res.status(200).send(results)
    }

    // if(approach === ApproachDefinitions.ASK_RETRIEVE_READ){
    //   // Resolve Approach
    //   // xxxxxxx
    //   if (stream) {
    //     const buffer = new Readable();
    //     // Dummy implementation needed
    //     buffer._read = () => {};
    //     res.type('application/x-ndjson').send(buffer);

    //     const chunks = await askApproach.runWithStreaming(messages[0].content, (context as any) ?? {});
    //     for await (const chunk of chunks) {
    //       buffer.push(JSON.stringify(chunk) + '\n');
    //     }
    //     // eslint-disable-next-line unicorn/no-null
    //     buffer.push(null);
    //   } else {
    //     return await askApproach.run(messages[0].content, (context as any) ?? {});
    //   }
    // }
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

export class PostChatReq {

  @IsNotEmpty()
  @IsEnum(ApproachDefinitions)
  approach: ApproachDefinitions
  
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Message)
  messages: Message[]

  @ValidateNested()
  context?: PostApproachContext 

  @IsBoolean()
  stream: Boolean
}

class Message {
  @IsString()
  role: string;

  @IsString()
  content: string;
}

class PostApproachContext {
  @IsOptional()
  @IsIn(['hybrid', 'text', 'vectors'])
  retrieval_mode?: 'hybrid' | 'text' | 'vectors';

  @IsOptional()
  @IsBoolean()
  semantic_ranker?: boolean;

  @IsOptional()
  @IsBoolean()
  semantic_captions?: boolean;

  @IsOptional()
  @IsNumber()
  top?: number;

  @IsOptional()
  @IsNumber()
  temperature?: number;

  @IsOptional()
  @IsString()
  prompt_template?: string;

  @IsOptional()
  @IsString()
  prompt_template_prefix?: string;

  @IsOptional()
  @IsString()
  prompt_template_suffix?: string;

  @IsOptional()
  @IsString()
  exclude_category?: string;
}