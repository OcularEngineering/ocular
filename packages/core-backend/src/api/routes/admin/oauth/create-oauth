import { IsNotEmpty, IsString } from "class-validator"

import { OAuthService } from "../../../services"
import { validator } from "../../../utils/validator"

export default async (req, res) => {
  const validated = await validator(PostOauthReq, req.body)
  const oauthService: OAuthService = req.scope.resolve("oauthService")
  const data = await oauthService.generateToken(
    validated.application_name,
    validated.code,
    // validated.state
  )
  res.status(200).json({ apps: data })
}

/**
 * @schema AdminPostAppsReq
 * type: object
 * required:
 *   - application_name
 *   - state
 *   - code
 * properties:
 *   application_name:
 *     type: string
 *     description: Name of the application for to generate the token for.
 *   state:
 *     type: string
 *     description: State of the application.
 *   code:
 *     type: string
 *     description: The code for the generated token.
 */
export class PostOauthReq {
  @IsString()
  @IsNotEmpty()
  application_name: string

  @IsString()
  @IsNotEmpty()
  state: string

  @IsString()
  @IsNotEmpty()
  code: string
}
