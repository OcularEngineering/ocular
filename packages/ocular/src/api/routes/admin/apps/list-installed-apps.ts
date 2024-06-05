import { OAuthService } from "../../../../services";

export default async (req, res) => {
  const oauthService: OAuthService = req.scope.resolve("oauthService");
  const appList = await oauthService.list({});

  if (!appList) {
    return res.status(200).json({ apps: [] });
  }
  return res.status(200).json({ apps: appList });
};
