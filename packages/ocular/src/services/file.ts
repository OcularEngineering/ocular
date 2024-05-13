import {
  AbstractFileService,
  FileDeleteData,
  FileGetData,
  FileUploadData,
  FileUploadResult,
} from "@ocular/types";
import { AutoflowAiError, AutoflowAiErrorTypes } from "@ocular/utils";
import path from "path";
import fs from "fs/promises";

export default class FileService extends AbstractFileService {
  static identifier = "localfs";
  protected uploadDir_: string;
  protected backendUrl_: string;

  constructor(
    protected readonly container: Record<string, unknown>,
    protected readonly config?: Record<string, unknown> // eslint-disable-next-line @typescript-eslint/no-empty-function
  ) {
    super(container, config);
    (this.uploadDir_ = "/uploads"),
      (this.backendUrl_ = "http://localhost:9000");
  }

  async upload(file: FileUploadData): Promise<FileUploadResult> {
    if (!file) {
      throw new AutoflowAiError(
        AutoflowAiErrorTypes.INVALID_DATA,
        `No file provided`
      );
    }

    if (!file.filename) {
      throw new AutoflowAiError(
        AutoflowAiErrorTypes.INVALID_DATA,
        `No filename provided`
      );
    }

    const parsedFilename = path.parse(file.filename);

    if (parsedFilename.dir) {
      this.ensureDirExists(parsedFilename.dir);
    }

    const fileKey = path.join(
      parsedFilename.dir,
      `${Date.now()}-${parsedFilename.base}`
    );

    const filePath = this.getUploadFilePath(fileKey);
    const fileUrl = this.getUploadFileUrl(fileKey);

    const content = Buffer.from(file.content, "binary");
    await fs.writeFile(filePath, content);

    return {
      key: fileKey,
      url: fileUrl,
    };
  }

  async delete(file: FileDeleteData): Promise<void> {
    const filePath = this.getUploadFilePath(file.fileKey);
    try {
      await fs.access(filePath, fs.constants.F_OK);
      await fs.unlink(filePath);
    } catch (e) {
      // The file does not exist, so it's a noop.
    }

    return;
  }

  async getPresignedDownloadUrl(fileData: FileGetData): Promise<string> {
    try {
      await fs.access(
        this.getUploadFilePath(fileData.fileKey),
        fs.constants.F_OK
      );
    } catch {
      throw new AutoflowAiError(
        AutoflowAiErrorTypes.FILE_NOT_FOUND,
        `File with key ${fileData.fileKey} not found`
      );
    }

    return this.getUploadFileUrl(fileData.fileKey);
  }

  private getUploadFilePath = (fileKey: string) => {
    return path.join(this.uploadDir_, fileKey);
  };

  private getUploadFileUrl = (fileKey: string) => {
    return path.join(this.backendUrl_, this.getUploadFilePath(fileKey));
  };

  private async ensureDirExists(dirPath: string) {
    const relativePath = path.join(this.uploadDir_, dirPath);
    try {
      await fs.access(relativePath, fs.constants.F_OK);
    } catch (e) {
      await fs.mkdir(relativePath, { recursive: true });
    }
  }
}
