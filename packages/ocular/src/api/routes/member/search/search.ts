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
    const { q, context } = await validator(PostSearchReq, req.body);
    const searchService = req.scope.resolve("searchService");
    const loggedInUser = req.scope.resolve("loggedInUser");
    const searchResults = await searchService.searchDocuments(null, q, context);
    const sources = new Set(
      searchResults.map(
        (hit) => hit.documentMetadata?.source as AppNameDefinitions
      )
    );
    return res.status(200).send({ hits: searchResults, sources: [...sources] });
  } catch (_error: unknown) {
    console.log(_error);
    return res.status(500).send(`Error: Failed to Search .`);
  }
};

class PostSearchReq {
  @IsString()
  q: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SearchContextReq)
  context?: SearchContextReq;
}

class SearchContextReq {
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
}
class DateRange {
  @IsOptional()
  @IsDateString()
  from: string;

  @IsOptional()
  @IsDateString()
  to: string;
}
