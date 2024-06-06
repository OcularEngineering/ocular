import { AppAuthorizationService } from "../../../../services";

export default async (req, res) => {
  const { id } = req.params;
  const appAuthorizationService: AppAuthorizationService = req.scope.resolve(
    "appAutherizationService"
  );

  const authToken = await appAuthorizationService.retrieveById({
    app_id: id,
  });

  if (!authToken) {
    return res.status(404).json({ message: "No app data found" });
  }

  res.status(200).json({ app: authToken });
};
