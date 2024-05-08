import { IsNotEmpty, IsString, IsOptional, IsEnum } from "class-validator";
import { validator } from "@ocular/utils";
import { OAuthService, OrganisationService } from "../../../../services";
import { AppNameDefinitions } from "@ocular/types";
import { EventBusService } from "../../../../services";
const { v4: uuidv4 } = require("uuid");

const link_id = uuidv4();

export default async (req, res) => {
  const validated = await validator(PostAppsReq, req.body);
  const eventBus_: EventBusService = req.scope.resolve("eventBusService");
  const loggedInUser = req.scope.resolve("loggedInUser");
  const organisationService: OrganisationService = req.scope.resolve(
    "organisationService"
  );

  try {
    const org = await organisationService.listInstalledApps();
    const installed_apps: any = org.installed_apps;
    const webConnector_index = installed_apps.findIndex(
      (app) => app.name === validated.name
    );

    if (webConnector_index !== -1) {
      if (!installed_apps[webConnector_index].links) {
        installed_apps[webConnector_index].links = [];
      }
      installed_apps[webConnector_index].links.push({
        id: link_id,
        location: validated.link,
        status: "processing",
      });

      await organisationService.update(loggedInUser.organisation_id, {
        installed_apps,
      });
      await eventBus_.emit("webConnectorInstalled", {
        organisation: loggedInUser.organisation,
        app_name: validated.name,
        link: validated.link,
        link_id,
      });
      res.status(200).json({ message: "Link saved successfully!" });
    } else {
      res.status(404).json({ error: "Web connector not found." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: `Error saving ${validated.link} for ${validated.name}: ${error.message}`,
    });
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
