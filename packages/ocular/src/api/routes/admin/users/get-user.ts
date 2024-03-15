import { Request, Response } from "express"

import { UserService } from "../../../../services"
import { FindParams } from "../../../../types/common"

/**
 * @oas [get] /admin/users/{id}
 * summary: "Get a User"
 * description: "Retrieve a User by ID."
 * x-authenticated: true
 * parameters:
 *   - (path) id=* {string} Id of the User.
 *   - (query) expand {string} Comma-separated relations that should be expanded in the returned team.
 *   - (query) fields {string} Comma-separated fields that should be included in the team.
 */
export default async (req: Request, res: Response) => {
  const { id } = req.params

  const userService: UserService= req.scope.resolve(
    "userService"
  )

  const team = await userService.retrieve(
    id,
    req.retrieveConfig
  )

  res.json({ user: team })
}

export class GetUserParams extends FindParams {}