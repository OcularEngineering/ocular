import FileService from "../file"; // adjust the import path according to your project structure
import fs from "fs/promises";
import path from "path";

jest.mock("fs/promises");

describe("FileService", () => {
  let fileService;
  let mockFile;

  const RealDate = Date;

  function mockDate(isoDate: string) {
    global.Date = class extends RealDate {
      constructor() {
        super();
        return new RealDate(isoDate);
      }
      static now() {
        return new RealDate(isoDate).getTime();
      }
    } as DateConstructor;
  }

  beforeEach(() => {
    fileService = new FileService({}, {});
    mockFile = {
      filename: "test.txt",
      content: "Hello, world!",
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should throw an error if no file is provided", async () => {
    await expect(fileService.upload()).rejects.toThrow("No file provided");
  });

  it("should throw an error if no filename is provided", async () => {
    mockFile.filename = "";
    await expect(fileService.upload(mockFile)).rejects.toThrow(
      "No filename provided"
    );
  });

  it("should write the file content to the correct path and return the key and url", async () => {
    mockDate("2022-01-01T00:00:00Z");
    const spy = jest.spyOn(fs, "writeFile");
    const fileKey = path.join(
      path.parse(mockFile.filename).dir,
      `${Date.now()}-${path.parse(mockFile.filename).base}`
    );
    const filePath = path.join(fileService.uploadDir_, fileKey);

    const fileData = await fileService.upload(mockFile);

    expect(spy).toHaveBeenCalledWith(
      filePath,
      Buffer.from(mockFile.content, "binary")
    );

    expect(fileData).toEqual({
      key: "1640995200000-test.txt",
      url: "http:/localhost:9000/uploads/1640995200000-test.txt",
    });
  });

  it("should delete the file at the correct path", async () => {
    const spy = jest.spyOn(fs, "unlink");
    const fileKey = "test.txt";
    const filePath = path.join(fileService.uploadDir_, fileKey);

    await fileService.delete({ fileKey });

    expect(spy).toHaveBeenCalledWith(filePath);
  });

  it("should get presigned download url", async () => {
    const fileKey = "test.txt";
    const filePath = path.join(
      "http:/localhost:9000",
      fileService.uploadDir_,
      fileKey
    );

    await expect(
      fileService.getPresignedDownloadUrl({ fileKey })
    ).resolves.toBe(filePath);
  });
});
