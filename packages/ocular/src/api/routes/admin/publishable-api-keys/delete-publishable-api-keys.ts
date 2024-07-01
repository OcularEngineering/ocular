import { EntityManager } from "typeorm"

import PublishableApiKeyService from "../../../../services/publishable-api-key"

export default async (req, res) => {
  const { id } = req.params

  const publishableApiKeyService: PublishableApiKeyService = req.scope.resolve(
    "publishableApiKeyService"
  )

  const manager: EntityManager = req.scope.resolve("manager")

  await manager.transaction(async (transactionManager) => {
    await publishableApiKeyService
      .withTransaction(transactionManager)
      .delete(id)
  })

  res.status(200).send({
    id,
    object: "publishable_api_key",
    deleted: true,
  })
}
