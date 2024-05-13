import fs from "fs";
import { EntityManager } from "typeorm";
import files from ".";
import {
  AppNameDefinitions,
  DocType,
  IndexableDocument,
  OCULAR_API_INDEXING_TOPIC,
} from "@ocular/types";
import { DocumentMetadata } from "../../../../models";
// import { DocType } from "../../../../types";

export default async (req, res) => {
  try {
    const fileService = req.scope.resolve("fileService");
    const documentMetadataService = req.scope.resolve(
      "documentMetadataService"
    );
    const queueService = req.scope.resolve("queueService");
    const loggedInUser = req.scope.resolve("loggedInUser");
    const manager: EntityManager = req.scope.resolve("manager");
    const docMetadatas = await manager.transaction(
      async (transactionManager) => {
        // Upload Files To File Service
        const files = await Promise.all(
          req.files.map(async (f) => {
            return fileService.upload(f).then((result) => {
              fs.unlinkSync(f.path);
              return result;
            });
          })
        );

        files.map((file) => {
          console.log("File", file);
        });

        // Create Indexable Documents For The Uploaded Files
        const documents: IndexableDocument[] = files.map((file) => {
          return {
            id: file.key,
            organisationId: loggedInUser.organisation_id,
            source: AppNameDefinitions.OCULAR_API,
            title: file.name,
            type: file.extension as DocType,
            updatedAt: new Date(),
            metadata: {},
          };
        });
        // Create Document Metadata For The Uploaded Files
        const metadatas: DocumentMetadata =
          await documentMetadataService.batchCreateOrUpdate(documents);
        // Index The Uploaded Files
        queueService.sendBatch(OCULAR_API_INDEXING_TOPIC, documents);
        return metadatas;
      }
    );
    res.status(200).json({ uploads: docMetadatas });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export class IAdminPostUploadsFileReq {
  originalName: string;
  path: string;
}
