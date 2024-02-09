import { IsNumber, IsOptional, IsString } from "class-validator"
import { Request, Response } from "express"
import { TeamService } from "../../../../services"
import { FilterableTeamProps } from "../../../../types/team"
import { Type } from "class-transformer"

/**
 * @oas [get] /admin/teams
 * summary: "List Teams"
 * description: "Retrieve a list of teams. The teams filtered by fields such as `name` or `id. The teams can also be sorted or paginated."
 * x-authenticated: true
 * parameters:
 *   - (query) q {string} term to search teams by name.
 *   - (query) offset=0 {integer} The number of teams to skip when retrieving the teams.
 *   - (query) order {string} A field to sort order the retrieved teams by.
 *   - in: query
 *     name: id
 *     style: form
 *     explode: false
 *     description: Filter by the team ID
 *     schema:
 *       oneOf:
 *         - type: string
 *           description: team ID
 *         - type: array
 *           description: an array of team IDs
 *           items:
 *             type: string
 *         - type: object
 *           properties:
 *             lt:
 *               type: string
 *               description: filter by IDs less than this ID
 *             gt:
 *               type: string
 *               description: filter by IDs greater than this ID
 *             lte:
 *               type: string
 *               description: filter by IDs less than or equal to this ID
 *             gte:
 *               type: string
 *               description: filter by IDs greater than or equal to this ID
 *   - in: query
 *     name: name
 *     style: form
 *     explode: false
 *     description: Filter by the team name
 *     schema:
 *       type: array
 *       description: an array of team names
 *       items:
 *         type: string
 *         description: team name
 *   - in: query
 *     name: created_at
 *     description: Filter by a creation date range.
 *     schema:
 *       type: object
 *       properties:
 *         lt:
 *            type: string
 *            description: filter by dates less than this date
 *            format: date
 *         gt:
 *            type: string
 *            description: filter by dates greater than this date
 *            format: date
 *         lte:
 *            type: string
 *            description: filter by dates less than or equal to this date
 *            format: date
 *         gte:
 *            type: string
 *            description: filter by dates greater than or equal to this date
 *            format: date
 *   - in: query
 *     name: updated_at
 *     description: Filter by an update date range.
 *     schema:
 *       type: object
 *       properties:
 *         lt:
 *            type: string
 *            description: filter by dates less than this date
 *            format: date
 *         gt:
 *            type: string
 *            description: filter by dates greater than this date
 *            format: date
 *         lte:
 *            type: string
 *            description: filter by dates less than or equal to this date
 *            format: date
 *         gte:
 *            type: string
 *            description: filter by dates greater than or equal to this date
 *            format: date
 *   - (query) limit=10 {integer} The number of teams to return.
 *   - (query) expand {string} Comma-separated relations that should be expanded in the returned teams.
 */
export default async (req: Request, res: Response) => {
  const teamService : TeamService = req.scope.resolve(
    "teamService"
  )

  const [data, count] = await teamService.listAndCount(
    req.filterableFields,
    req.listConfig
  )

  const { limit, offset } = req.validatedQuery
  res.json({
    count,
    teams: data,
    offset,
    limit,
  })
}

/**
 * Parameters used to filter and configure the pagination of the retrieved teams.
 */
export class GetTeamsParams extends FilterableTeamProps {
  /**
   * The field to sort the data by. By default, the sort order is ascending. To change the order to descending, prefix the field name with `-`.
   */
  @IsString()
  @IsOptional()
  order?: string

  /**
   * {@inheritDoc FindPaginationParams.offset}
   */
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  offset?: number = 0

  /**
   * {@inheritDoc FindPaginationParams.limit}
   */
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10

  /**
   * {@inheritDoc FindParams.expand}
   */
  @IsString()
  @IsOptional()
  expand?: string
}