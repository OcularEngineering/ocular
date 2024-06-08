import { Request, Response } from "express"
import { IsOptional, IsString } from "class-validator"

import { extendedFindParamsMixin } from "../../../../types/common"
import PublishableApiKeyService from "../../../../services/publishable-api-key"

export default async (req: Request, res: Response) => {
  const publishableApiKeyService: PublishableApiKeyService = req.scope.resolve(
    "publishableApiKeyService"
  )

  const { filterableFields, listConfig } = req
  const { skip, take } = listConfig

  const [pubKeys, count] = await publishableApiKeyService.listAndCount(
    filterableFields,
    listConfig
  )

  return res.json({
    publishable_api_keys: pubKeys,
    count,
    limit: take,
    offset: skip,
  })
}

export class GetPublishableApiKeysParams extends extendedFindParamsMixin({
  limit: 20,
  offset: 0,
}) {
  @IsString()
  @IsOptional()
  q?: string
}
