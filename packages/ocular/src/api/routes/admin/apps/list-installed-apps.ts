import { AppAuthorizationService } from "../../../../services";

export default async (req, res) => {
  const appAuthorizationService: AppAuthorizationService = req.scope.resolve(
    "appAuthorizationService"
  );
  const appList = await appAuthorizationService.list({});

  if (!appList) {
    return res.status(200).json({ apps: [] });
  }
  return res.status(200).json({ apps: appList });
};
