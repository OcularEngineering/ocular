import { TransactionBaseService } from "./transaction-base-service";
import {
  DeleteFileType,
  FileServiceGetUploadStreamResult,
  FileServiceUploadResult,
  GetUploadedFileType,
  UploadStreamDescriptorType,
} from "@medusajs/types";

export interface IFileService extends TransactionBaseService {
  upload(file: Express.Multer.File): Promise<FileServiceUploadResult>;
  uploadProtected(file: Express.Multer.File): Promise<FileServiceUploadResult>;
  delete(fileData: DeleteFileType): Promise<void>;
  getUploadStreamDescriptor(
    fileData: UploadStreamDescriptorType
  ): Promise<FileServiceGetUploadStreamResult>;

  getDownloadStream(
    fileData: GetUploadedFileType
  ): Promise<NodeJS.ReadableStream>;
  getPresignedDownloadUrl(fileData: GetUploadedFileType): Promise<string>;
}

export abstract class AbstractFileService
  extends TransactionBaseService
  implements IFileService
{
  /**
   * @ignore
   */
  static _isFileService = true;

  /**
   * @ignore
   */
  static isFileService(object): object is AbstractFileService {
    return object?.constructor?._isFileService;
  }

  protected constructor(
    protected readonly container: Record<string, unknown>,
    protected readonly config?: Record<string, unknown> // eslint-disable-next-line @typescript-eslint/no-empty-function
  ) {
    super(container, config);
  }

  abstract upload(
    fileData: Express.Multer.File
  ): Promise<FileServiceUploadResult>;

  abstract uploadProtected(
    fileData: Express.Multer.File
  ): Promise<FileServiceUploadResult>;

  abstract delete(fileData: DeleteFileType): Promise<void>;

  abstract getUploadStreamDescriptor(
    fileData: UploadStreamDescriptorType
  ): Promise<FileServiceGetUploadStreamResult>;

  abstract getDownloadStream(
    fileData: GetUploadedFileType
  ): Promise<NodeJS.ReadableStream>;

  abstract getPresignedDownloadUrl(
    fileData: GetUploadedFileType
  ): Promise<string>;
}
