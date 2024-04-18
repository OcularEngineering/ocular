import { ValidateNested, IsOptional, IsString } from "class-validator"
import { SearchService } from "../../../../services"
import { validator } from "@ocular/utils"
import { SearchContext } from "@ocular/types"

export default async (req, res) => {
  try {
    // const validated = await validator(PostSearchReq, req.body)
    const { q, context} = req.body;
    const loggedInUser = req.scope.resolve("loggedInUser")
    // const searchService = req.scope.resolve("searchService") as SearchService;
    // const searchResults = await searchService.executeSearchApproach(q,context);
    const approach = req.scope.resolve("askRetrieveReadApproache")
    const searchResults = await approach.run(loggedInUser.organisation_id.toLowerCase().substring(4),q, context);
    return res.status(200).send(searchResults);
  } catch (_error: unknown) {
    console.log(_error)
    return res.status(500).send(`Error: Failed to execute AskApproach.`);
  }
}


// export class PostSearchReq {
//   @IsOptional()
//   @IsString()
//   q?: string

//   @ValidateNested()
//   context?: SearchContext
// }