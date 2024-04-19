import { ValidateNested, IsOptional, IsString, IsBoolean, IsEnum, IsNumber   } from "class-validator"
import { SearchService } from "../../../../services"
import { validator } from "@ocular/utils"
import { AppNameDefinitions } from "@ocular/types"
import { Type } from "class-transformer"

// TODO: The SearchApproach used currently is hardcoded to be AskRetrieveReadApproach.
// Improve to dynamically resolve the SearchApproaches based on the approach enum.
export default async (req, res) => {
  try {
    console.log("PostSearchReq",req.body)
    const validated = await validator(PostSearchReq, req.body)
    const { q, context } = validated;
    const loggedInUser = req.scope.resolve("loggedInUser")
    const searchApproach = req.scope.resolve("askRetrieveReadApproache")
    const results = await searchApproach.run(loggedInUser.organisation_id.toLowerCase().substring(4),q , (context as any) ?? {});
    return res.status(200).send(results)
  } catch (_error: unknown) {
    console.log(_error)
    return res.status(500).send(`Error: Failed to execute SearchApproach.`);
  }
}


class PostSearchReq {
  @IsString()
  q: string

  @IsOptional()
  @ValidateNested()
  @Type(() => SearchContextReq)
  context?: SearchContextReq
}

class SearchContextReq {
  @IsOptional()
  @IsBoolean()
  ai_completion?: boolean;

  @IsOptional()
  @IsString()
  prompt_template?: string;

  @IsOptional()
  @IsBoolean()
  suggest_followup_questions?: boolean;

  @IsOptional()
  @IsNumber()
  top?: number;

  @IsOptional()
  @IsEnum(AppNameDefinitions, { each: true })
  sources?: Set<AppNameDefinitions>;
}