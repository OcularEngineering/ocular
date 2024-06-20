import { IsNotEmpty, IsString, IsEnum, IsOptional } from "class-validator";
import { validator } from "@ocular/utils";
import {
  AppAuthorizationService,
  OrganisationService,
} from "../../../../services";
import { AppNameDefinitions } from "@ocular/types";

export default async (req, res) => {
  const validated = await validator(PostAppsReq, req.body);
  const appAuthorizationService: AppAuthorizationService = req.scope.resolve(
    "appAuthorizationService"
  );
  const organisationService: OrganisationService = req.scope.resolve(
    "organisationService"
  );

  appAuthorizationService
    .generateToken(validated.name, validated.code, validated.installationId)
    .then((data) => {
      return organisationService.installApp(validated.name);
    })
    .then((org) => {
      res.status(200).json({ apps: null });
    })
    .catch((error) => {
      // Handle error
      res.status(500).json({ error: `Error Installing App ${validated.name}` });
    });
};

export class PostAppsReq {
  @IsNotEmpty()
  @IsEnum(AppNameDefinitions)
  name: AppNameDefinitions;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsOptional()
  installationId?: string;
}
