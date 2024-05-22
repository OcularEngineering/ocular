import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { validator } from "@ocular/utils";
import { OAuthService, OrganisationService } from "../../../../services";
import { AppNameDefinitions } from "@ocular/types";
const { v4: uuidv4 } = require("uuid");

export default async (req, res) => {
  const validated = await validator(PostAppsReq, req.body);
  const loggedInUser = req.scope.resolve("loggedInUser");
  const organisationService: OrganisationService = req.scope.resolve(
    "organisationService"
  );

  let data = {};
  console.log("ORG_ID", loggedInUser);
  switch (validated.name) {
    case AppNameDefinitions.WEBCONNECTOR:
      data = {
        ...(validated.metadata || {}),
        emit_event: true,
        status: "processing",
        link_id: uuidv4(),
        org_id: loggedInUser.organisation_id,
      };
      break;

    default:
      data = {
        ...(validated.metadata || {}),
      };
      break;
  }
  console.log("API REQUEST DATA", data);
  const installed_apps = await organisationService.updateInstalledApp(
    validated.name,
    data
  );

  if (true) {
    res.status(200).json({ message: "Link saved successfully!" });
  } else {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

class Metadata {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  link?: string;
}

export class PostAppsReq {
  @IsNotEmpty()
  @IsEnum(AppNameDefinitions)
  name: AppNameDefinitions;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Metadata)
  metadata?: Metadata;
}
