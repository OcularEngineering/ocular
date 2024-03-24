import { IsIn, ValidateNested, IsNumber, IsOptional, IsString, IsArray, IsBoolean, IsNotEmpty,IsEnum } from "class-validator"
import { Readable } from 'node:stream';
import { SearchService, UserService } from "../../../../services"
import { Type } from "class-transformer"
import { validator } from "@ocular/utils"
import { ApproachDefinitions, ApproachContext} from "@ocular/types";

/**
 * @oas [post] /v1/ask
 * operationId: Post Search
 * summary: Ask Ocular
 * description: "Ask Ocular About A Question."
 * 
 *  async run(indexName: string, userQuery: string, context?: ApproachContext): Promise
 */
export default async (req, res) => {

  const validated = await validator(PostAskReq, req.body)
  const { approach } = validated ?? {};
 try {


  const loggedInUser = req.scope.resolve("loggedInUser")

    if (approach === ApproachDefinitions.ASK_RETRIEVE_READ) {
      const { q, messages, context, stream } = req.body;
      const searchApproach = req.scope.resolve("askRetrieveReadApproache")
      const results = await searchApproach.run(loggedInUser.organisation_id.toLowerCase().substring(4),q , (context as any) ?? {});
      return res.status(200).send(results)
    }
  } catch (_error: unknown) {
    const error = _error as Error & { error?: any; status?: number };
    if (error.error) {
      return res.status(error.status ?? 500).send(error);
    }
    return res.status(500).send(error.message);
  }
  return res.status(500).send(`Error: Failed to execute AskApproach.`);
}

/**
 * @schema StorePostSearchReq
 * type: object
 * properties:
 *  q:
 *    type: string
 *    description: The search query.
 *  offset:
 *    type: number
 *    description: The number of products to skip when retrieving the products.
 *  limit:
 *    type: number
 *    description: Limit the number of products returned.
 *  filter:
 *    description: Pass filters based on the search service.
 */
export class PostAskReq {

  @IsOptional()
  @IsString()
  q?: string

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