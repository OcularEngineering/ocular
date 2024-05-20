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
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { validator } from "@ocular/utils";

export default async (req, res) => {
  try {
    const { files } = await validator(UploadReq, { files: req.files });
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
        const uploaded_files = await Promise.all(
          files.map(async (f) => {
            return fileService.upload(f).then((result) => {
              fs.unlinkSync(f.path);
              return result;
            });
          })
        );

        // Create Indexable Documents For The Uploaded Files
        const documents: IndexableDocument[] = uploaded_files.map((file) => {
          return {
            id: file.key,
            organisationId: loggedInUser.organisation_id,
            source: AppNameDefinitions.OCULAR_API,
            title: file.name,
            type: file.extension as DocType,
            updatedAt: new Date(),
            metadata: {
              key: file.key,
              url: file.url,
            },
          };
        });
        // Create Document Metadata For The Uploaded Files
        const metadatas: DocumentMetadata =
          await documentMetadataService.batchCreateOrUpdate(documents);
        // Add Uploader Files To Queue Fore Indexing
        await queueService.sendBatch(OCULAR_API_INDEXING_TOPIC, documents);
        return metadatas;
      }
    );
    res.status(200).json({ uploads: docMetadatas });
  } catch (err: any) {
    // Delete Files Uploaded By Multer To Temp Folder Before Returning Error
    console.error(err);
    if (Array.isArray(files)) {
      files.map((f) => {
        if (fs.existsSync(f.path)) {
          fs.unlinkSync(f.path);
        }
      });
    }
    return res
      .status(500)
      .send(
        `Error: Failed Upload Files: err ${err.message}. Check if Document Type is Supported.`
      );
  }
};

export class IAdminPostUploadsFileReq {
  originalName: string;
  path: string;
}

enum Mimetype {
  PDF = "application/pdf",
  DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  TXT = "text/plain",
  MD = "text/markdown",
  CSV = "text/csv",
}

export class UploadReq {
  @IsNotEmpty()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FileDefinition)
  files: FileDefinition[];
}

export class FileDefinition {
  @IsString()
  @IsNotEmpty()
  fieldname: string;

  @IsString()
  @IsNotEmpty()
  originalname: string;

  @IsString()
  @IsNotEmpty()
  encoding: string;

  @IsOptional()
  @IsEnum(Mimetype)
  mimetype: Mimetype;

  @IsString()
  @IsNotEmpty()
  destination: string;

  @IsString()
  @IsNotEmpty()
  filename: string;

  @IsString()
  @IsNotEmpty()
  path: string;

  @IsInt()
  size: number;
}
