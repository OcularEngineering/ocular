import { Request, Response } from "express"

import { TeamService } from "../../../../services"
import { EntityManager } from "typeorm"

/**
 * @oas [delete] /admin/team/{id}
 * summary: "Delete a Team"
 * description: "Delete a Team"
 */

export default async (req: Request, res: Response) => {
  const { id } = req.params

  const teamService: TeamService = req.scope.resolve(
    "teamService"
  )

  const manager: EntityManager = req.scope.resolve("manager")
  await manager.transaction(async (transactionManager) => {
    return await teamService
      .withTransaction(transactionManager)
      .delete(id)
  })

  res.json({
    id: id,
    object: "team",
    deleted: true,
  })
}