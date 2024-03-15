import { IsNotEmpty, IsString, IsEnum} from "class-validator"
import { OrganisationService } from "../../../../services"
import { validator } from "@ocular/utils"
import {AppNameDefinitions} from "@ocular/types"

export default async (req, res) => {
  console.log("req.body  code ->", req.body)
  const organisationService: OrganisationService = req.scope.resolve("organisationService")
  const org = await organisationService.listInstalledApps()
  if (!org) {
    res.status(404).json({ message: "No organisation found" })
  }
  if (!org.installed_apps) {
    res.status(200).json({ apps: []})
  }
  res.status(200).json({ apps: org.installed_apps })
}
