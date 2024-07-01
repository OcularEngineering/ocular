import { Request, Response } from "express"
import { IsOptional, IsString } from "class-validator"
import { EntityManager } from "typeorm"

import PublishableApiKeyService from "../../../../services/publishable-api-key"

export default async (req: Request, res: Response) => {
  const { id } = req.params
  const { validatedBody } = req as {
    validatedBody: AdminPostPublishableApiKeysPublishableApiKeyReq
  }

  const publishableApiKeysService: PublishableApiKeyService = req.scope.resolve(
    "publishableApiKeyService"
  )

  const manager: EntityManager = req.scope.resolve("manager")

  const updatedKey = await manager.transaction(async (transactionManager) => {
    return await publishableApiKeysService
      .withTransaction(transactionManager)
      .update(id, validatedBody)
  })

  res.status(200).json({ publishable_api_key: updatedKey })
}

/**
 * @schema AdminPostPublishableApiKeysPublishableApiKeyReq
 * type: object
 * properties:
 *   title:
 *     description: A title to update for the key.
 *     type: string
 */
export class AdminPostPublishableApiKeysPublishableApiKeyReq {
  @IsString()
  @IsOptional()
  title?: string
}
