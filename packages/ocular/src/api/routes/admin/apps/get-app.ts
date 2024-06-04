import { OAuthService } from "../../../../services";
import { IsNotEmpty, IsEnum } from "class-validator";
import { AppNameDefinitions } from "@ocular/types";
import { validator } from "@ocular/utils";

export default async (req, res) => {
  const loggedInUser = req.scope.resolve("loggedInUser");
  const validated = await validator(PostAppsReq, req.body);

  const oauthService: OAuthService = req.scope.resolve("oauthService");
  const oauthToken = await oauthService.retrieve({
    id: loggedInUser.organisation_id,
    app_name: validated.name,
  });

  if (!oauthToken) {
    return res.status(404).json({ message: "No app data found" });
  }

  res.status(200).json({ app: oauthToken });
};

export class PostAppsReq {
  @IsNotEmpty()
  @IsEnum(AppNameDefinitions)
  name: AppNameDefinitions;
}
