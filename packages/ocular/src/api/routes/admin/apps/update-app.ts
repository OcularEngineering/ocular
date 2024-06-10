import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  ValidateNested,
} from "class-validator";
import { AppNameDefinitions } from "@ocular/types";
import { Type } from "class-transformer";
import { validator } from "@ocular/utils";
import { AppAuthorizationService } from "../../../../services";
const { v4: uuidv4 } = require("uuid");

export default async (req, res) => {
  const validated = await validator(PostAppsReq, req.body);
  const appAuthorizationService: AppAuthorizationService = req.scope.resolve(
    "appAuthorizationService"
  );

  let data = {};
  switch (validated.name) {
    case AppNameDefinitions.WEBCONNECTOR:
      data = {
        ...validated.metadata,
        emit_event: true,
        status: "processing",
        link_id: uuidv4(),
      };
      break;

    default:
      data = {
        ...validated.metadata,
      };
      break;
  }
  const response = await appAuthorizationService.updateInstalledApp(
    validated.name,
    validated.app_id,
    data
  );

  if (response) {
    res.status(200).json({ message: response });
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
  @IsString()
  app_id: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Metadata)
  metadata?: Metadata;
}
