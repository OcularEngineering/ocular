import { IsNotEmpty, IsString } from "class-validator"

import { OAuthService } from "../../../../services"
import { validator } from "../../../../utils/validator"

export default async (req, res) => {
  console.log("req.body  code ->", req.body)
  const validated = await validator(PostAppsReq, req.body)
  const oauthService: OAuthService = req.scope.resolve("oauthService")
  const data = await oauthService.generateToken(
    validated.name,
    validated.code
  )
  res.status(200).json({ apps: null })
}

export class PostAppsReq {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  code: string
}