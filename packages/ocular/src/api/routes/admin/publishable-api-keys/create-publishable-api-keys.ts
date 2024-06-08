import { Request, Response } from "express"
import { EntityManager } from "typeorm"
import { IsString } from "class-validator"

import PublishableApiKeyService from "../../../../services/publishable-api-key"

export default async (req: Request, res: Response) => {
  const publishableApiKeyService = req.scope.resolve(
    "publishableApiKeyService"
  ) as PublishableApiKeyService

  const manager = req.scope.resolve("manager") as EntityManager
  const data = req.validatedBody as AdminPostPublishableApiKeysReq

  const loggedInUserId = (req.user?.id ?? req.user?.userId) as string

  const pubKey = await manager.transaction(async (transactionManager) => {
    return await publishableApiKeyService
      .withTransaction(transactionManager)
      .create(data, { loggedInUserId })
  })

  return res.status(200).json({ publishable_api_key: pubKey })
}

/**
 * @schema AdminPostPublishableApiKeysReq
 * type: object
 * required:
 *   - title
 * properties:
 *   title:
 *     description: A title for the publishable api key
 *     type: string
 */
export class AdminPostPublishableApiKeysReq {
  @IsString()
  title: string
}