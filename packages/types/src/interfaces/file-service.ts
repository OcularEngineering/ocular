import { TransactionBaseService } from "./transaction-base-service";

export type FileUploadResult = {
  url: string;
  key: string;
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
  filename: string;
  mimeType: string;
  content: string;
};
export interface IFileProvider {
  upload(file: FileUploadData): Promise<FileUploadResult>;
  delete(fileData: FileDeleteData): Promise<void>;
  getPresignedDownloadUrl(fileData: FileGetData): Promise<string>;
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

  async upload(file: FileUploadData): Promise<FileUploadResult> {
    throw Error("upload must be overridden by the child class");
  }
  async delete(file: FileDeleteData): Promise<void> {
    throw Error("delete must be overridden by the child class");
  }

  async getPresignedDownloadUrl(fileData: FileGetData): Promise<string> {
    throw Error(
      "getPresignedDownloadUrl must be overridden by the child class"
    );
  }
}
