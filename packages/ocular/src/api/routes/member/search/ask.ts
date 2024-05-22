import {
  ValidateNested,
  IsOptional,
  IsString,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsDateString,
} from "class-validator";
import { SearchService } from "../../../../services";
import { validator } from "@ocular/utils";
import { AppNameDefinitions, DocType } from "@ocular/types";
import { Type } from "class-transformer";

export default async (req, res) => {
  try {
    const { q, context } = await validator(PostAskReq, req.body);
    const searchApproach = req.scope.resolve("askRetrieveReadApproache");
    const loggedInUser = req.scope.resolve("loggedInUser");
    if (context && context.stream) {
      const chunks = await searchApproach.runWithStreaming(
        q,
        (context as any) ?? {}
      );
      // Stream the Search Results
      for await (const chunk of chunks) {
        res.write(JSON.stringify(chunk) + "\n");
      }
      res.status(200);
      res.end();
    } else {
      const results = await searchApproach.run(
        loggedInUser.organisation_id.toLowerCase().substring(4),
        q,
        (context as any) ?? {}
      );
      return res.status(200).send(results);
    }
  } catch (_error: unknown) {
    console.log(_error);
    return res.status(500).send(`Error: Failed to execute SearchApproach.`);
  }
};

class PostAskReq {
  @IsString()
  q: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AskContextReq)
  context?: AskContextReq;
}

class AskContextReq {
  @IsOptional()
  @IsBoolean()
  suggest_followup_questions?: boolean;

  @IsOptional()
  @IsNumber()
  top?: number;

  @IsOptional()
  @IsEnum(AppNameDefinitions, { each: true })
  sources?: Set<AppNameDefinitions>;

  @IsOptional()
  @IsEnum(DocType, { each: true })
  types?: Set<DocType>;

  @IsOptional()
  @ValidateNested()
  @Type(() => DateRange)
  date: DateRange;

  @IsOptional()
  @IsBoolean()
  stream?: boolean;
}

class DateRange {
  @IsOptional()
  @IsDateString()
  from: string;

  @IsOptional()
  @IsDateString()
  to: string;
}
