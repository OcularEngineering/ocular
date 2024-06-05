import { AppNameDefinitions } from "@ocular/types";
import { OAuthService } from "../../../../services";

export default async (req, res) => {
  const { id } = req.params;
  const oauthService: OAuthService = req.scope.resolve("oauthService");

  const oauthToken = await oauthService.retrieveById({
    app_id: id,
  });

  if (!oauthToken) {
    return res.status(404).json({ message: "No app data found" });
  }

  res.status(200).json({ app: oauthToken });
};
