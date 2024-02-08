import { Request, Response } from "express"

import { OrganisationService} from "../../../services"
import { FindParams } from "../../../types/common"

/**
 * @oas [get] /admin/teams/{id}
 * summary: "Get a Team"
 * description: "Retrieve a Customer Group by its ID. You can expand the teams relations or select the fields that should be returned."
 * x-authenticated: true
 * parameters:
 *   - (path) id=* {string} The ID of the Customer Group.
 *   - (query) expand {string} Comma-separated relations that should be expanded in the returned team.
 *   - (query) fields {string} Comma-separated fields that should be included in the team.
 */
export default async (req: Request, res: Response) => {
  const { id } = req.params

  const organisationService: OrganisationService= req.scope.resolve(
    "organisationService"
  )

  const team = await organisationService.retrieve(
    id,
    req.retrieveConfig
  )

  res.json({ organisation: team })
}

export class GetOrganisationParams extends FindParams {}