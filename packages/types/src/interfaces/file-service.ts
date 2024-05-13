import { TransactionBaseService } from "./transaction-base-service";

export type FileUploadResult = {
  name: string;
  url: string;
  key: string;
  extension: string;
};

export type FileGetData = {
  fileKey: string;
  isPrivate?: boolean;
  [x: string]: unknown;
};

export type FileDeleteData = {
  fileKey: string;
  [x: string]: unknown;
};

export type FileUploadData = {
  originalname: string;
  filename: string;
  mimeType: string;
  path: string;
};

export interface IFileProvider {
  upload(file: Express.Multer.File): Promise<FileUploadResult>;
  delete(fileData: FileDeleteData): Promise<void>;
}

export interface FileServiceOptions {
  upload_dir?: string;
  backend_url?: string;
}

export class AbstractFileService
  extends TransactionBaseService
  implements IFileProvider
{
  static _isFileService = true;
  static isFileService(object): object is AbstractFileService {
    return object?.constructor?._isFileService;
  }

  protected constructor(
    protected readonly container: Record<string, unknown>,
    protected readonly config?: Record<string, unknown> // eslint-disable-next-line @typescript-eslint/no-empty-function
  ) {
    super(container, config);
  }

  getIdentifier() {
    return (this.constructor as any).identifier;
  }

  async upload(file: Express.Multer.File): Promise<FileUploadResult> {
    throw Error("upload must be overridden by the child class");
  }
  async delete(file: FileDeleteData): Promise<void> {
    throw Error("delete must be overridden by the child class");
  }
}
