import {
  AbstractFileService,
  FileData,
  FileGetData,
  FileUploadData,
  FileUploadResult,
} from "@ocular/types";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { AutoflowAiError, AutoflowAiErrorTypes } from "@ocular/utils";
import path from "path";
import fs from "fs";
import * as fsPromise from "fs/promises";
import { parse } from "path";

export default class FileService extends AbstractFileService {
  static identifier = "localfs";
  protected uploadDir_: string;
  protected backendUrl_: string;

  constructor(
    protected readonly container: Record<string, unknown>,
    protected readonly config?: Record<string, unknown> // eslint-disable-next-line @typescript-eslint/no-empty-function
  ) {
    super(container, config);
    (this.uploadDir_ = "local-uploads"),
      (this.backendUrl_ = "http://localhost:9000");
    this.ensureDirExists("");
  }

  async upload(file: Express.Multer.File): Promise<FileUploadResult> {
    const parsedFilename = parse(file.originalname);

    if (parsedFilename.dir) {
      this.ensureDirExists(parsedFilename.dir);
    }

    const fileKey = path.join(
      parsedFilename.dir,
      `${Date.now()}-${parsedFilename.base}`
    );

    return new Promise((resolve, reject) => {
      fs.copyFile(file.path, `${this.uploadDir_}/${fileKey}`, (err) => {
        if (err) {
          reject(err);
          throw err;
        }

        const fileUrl = `${this.backendUrl_}/${this.uploadDir_}/${fileKey}`;

        resolve({
          name: file.originalname,
          url: fileUrl,
          key: fileKey,
          extension: parsedFilename.ext.slice(1),
        });
      });
    });
  }

  async delete(file: FileData): Promise<void> {
    try {
      const filePath = `${this.uploadDir_}/${file.fileKey}`;
      console.log(filePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch {
      throw new AutoflowAiError(
        AutoflowAiErrorTypes.FILE_NOT_FOUND,
        `File with key ${file.fileKey} not found`
      );
    }
  }

  async getDownloadStream(fileData: FileData): Promise<NodeJS.ReadableStream> {
    const filePath = `${this.uploadDir_}/${fileData.fileKey}`;
    return fs.createReadStream(filePath);
  }

  async getFileDataAsTxt(fileData: FileData): Promise<string> {
    const filePath = `${this.uploadDir_}/${fileData.fileKey}`;
    const extension = path.extname(fileData.fileKey);
    // const data = await fsPromise.readFile(filePath);
    // const blob = new Blob([data]);
    // console.log("Reading File", blob);

    let completeText = "";
    switch (extension) {
      case ".pdf":
        const loader = await new PDFLoader(filePath);
        const docs = await loader.load();
        completeText = await docs.map((doc) => doc.pageContent).join(" ");
        break;
      case ".txt":
        completeText = await fsPromise.readFile(filePath, "utf-8");
        break;
      default:
        throw new Error(`Unsupported file extension: ${extension}`);
    }
    return completeText;
  }

  private ensureDirExists(dirPath: string) {
    const relativePath = path.join(this.uploadDir_, dirPath);

    if (!fs.existsSync(relativePath)) {
      fs.mkdirSync(relativePath, { recursive: true });
    }
  }
}
