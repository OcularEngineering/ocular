import { AppNameDefinitions } from "@ocular/types";
import { DocumentMetadataService } from "../../../../services";

export default async (req, res) => {
  const logger = req.scope.resolve("logger");
  try {
    const documentMetadataService: DocumentMetadataService = req.scope.resolve(
      "documentMetadataService"
    );
    const loggedUser = req.scope.resolve("loggedInUser");
    const data = await documentMetadataService.list({
      source: AppNameDefinitions.OCULAR_API,
      organisation_id: loggedUser.organisation_id,
    });
    return res.status(200).json({ files: data });
  } catch (err) {
    logger.error("listFiles: Error listing uploaded files: " + err.message);
    return res.status(500).json({ error: err.message });
  }
};
