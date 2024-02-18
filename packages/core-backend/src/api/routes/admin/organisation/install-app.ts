import { IsNotEmpty, IsString, IsEnum} from "class-validator"
import { OrganisationService } from "../../../../services"
import { validator } from "../../../../utils/validator"
import {AppNameDefinitions} from "@ocular-ai/types"

export default async (req, res) => {
  console.log("req.body  code ->", req.body)
  const validated = await validator(InstallAppsReq, req.body)
  const organisationService: OrganisationService = req.scope.resolve("organisationService")
  const org = await organisationService.installApp(validated.name)
  res.status(200).json({ apps: org.installed_apps })
}

export class InstallAppsReq {
  @IsNotEmpty()
  @IsEnum(AppNameDefinitions)
  name: AppNameDefinitions
}