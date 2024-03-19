import { IsNotEmpty, IsString, IsEnum, IsOptional } from "class-validator"
import { validator } from "@ocular/utils"
import { OAuthService, OrganisationService } from "../../../../services"
import { AppNameDefinitions } from "@ocular/types"

export default async (req, res) => {
  const validated = await validator(PostAppsReq, req.body);
  const oauthService: OAuthService = req.scope.resolve("oauthService");
  const organisationService: OrganisationService = req.scope.resolve("organisationService");

  oauthService.generateToken(validated.name, validated.code, validated.installationId)
    .then(data => {
      return organisationService.installApp(validated.name);
    })
    .then(org => {
      res.status(200).json({ apps: null });
    })
    .catch(error => {
      // Handle error
      console.error(error);
      res.status(500).json({ error: `Error Authorizing App ${validated.name}`});
    });
}
export class PostAppsReq {
  @IsNotEmpty()
  @IsEnum(AppNameDefinitions)
  name: AppNameDefinitions

  @IsString()
  @IsNotEmpty()
  code: string

  @IsString()
  @IsOptional()
  installationId?: string
}