import { IsNotEmpty, IsString, IsOptional, IsEnum } from "class-validator";
import { validator } from "@ocular/utils";
import { OAuthService, OrganisationService } from "../../../../services";
import { AppNameDefinitions } from "@ocular/types";
import { EventBusService } from "../../../../services";
const { v4: uuidv4 } = require("uuid");

export default async (req, res) => {
  const validated = await validator(PostAppsReq, req.body);
  const eventBus_: EventBusService = req.scope.resolve("eventBusService");
  const loggedInUser = req.scope.resolve("loggedInUser");
  const organisationService: OrganisationService = req.scope.resolve(
    "organisationService"
  );

  const link_id = uuidv4();

  const data = {
    link: validated.link,
    link_id,
    status: "processing",
    emit_event: true,
  };

  const installed_apps = await organisationService.updateInstalledApp(
    validated.name,
    data
  );
  if (installed_apps) {
    res.status(200).json({ message: "Link saved successfully!" });
  } else {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export class PostAppsReq {
  @IsNotEmpty()
  @IsEnum(AppNameDefinitions)
  name: AppNameDefinitions;

  @IsString()
  @IsNotEmpty()
  link: string;
}
