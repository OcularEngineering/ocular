import { IsNotEmpty, IsString, IsEnum } from "class-validator";
import { OrganisationService, OAuthService } from "../../../../services";
import { validator } from "@ocular/utils";
import { AppNameDefinitions } from "@ocular/types";

export default async (req, res) => {
  console.log("req.body  code ->", req.body);
  const loggedInUser = req.scope.resolve("loggedInUser");

  const oauthService: OAuthService = req.scope.resolve("oauthService");
  const appList = await oauthService.list({
    organisation_id: loggedInUser.organisation_id,
  });

  if (!appList) {
    return res.status(200).json({ apps: [] });
  }
  return res.status(200).json({ apps: appList });
};
