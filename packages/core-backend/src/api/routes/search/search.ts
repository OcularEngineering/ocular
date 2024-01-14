 import { IsNumber, IsOptional, IsString } from "class-validator"

import { SearchService, UserService } from "../../../services"
import { Type } from "class-transformer"
import { validator } from "../../../utils/validator"

/**
 * @oas [post] /v1/search
 * operationId: Post Search
 * summary: Search User Index
 * description: "Run a search query using the search service installed on the backend."
 */
export default async (req, res) => {
  // As we want to allow wildcards, we pass a config allowing this
  const validated = await validator(PostSearchReq, req.body, {
    whitelist: false,
    forbidNonWhitelisted: false,
  })

  const { q, offset, limit, filter, ...options } = validated

  const paginationOptions = { offset, limit }

  const searchService: SearchService = req.scope.resolve("searchService")

  const results = await searchService.search(UserService.IndexName, q, {
    paginationOptions,
    filter,
    additionalOptions: options,
  })

  res.status(200).send(results)
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
export class PostSearchReq {
  @IsOptional()
  @IsString()
  q?: string

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  offset?: number

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number

  @IsOptional()
  filter?: string
}