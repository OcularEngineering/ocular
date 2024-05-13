import { Router } from "express";
import multer from "multer";
import middlewares, { transformBody } from "../../../middlewares";
import { AdminDeleteUploadsReq } from "./delete-upload";

const route = Router();
const upload = multer({ dest: "uploads/" });

export default (app) => {
  app.use("/uploads", route);

  route.post(
    "/",
    upload.array("files"),
    middlewares.wrap(require("./create-upload").default)
  );

  route.delete(
    "/",
    transformBody(AdminDeleteUploadsReq),
    middlewares.wrap(require("./delete-upload").default)
  );
  return app;
};

export type AdminUploadsRes = {
  uploads: { url: string }[];
};

export type AdminDeleteUploadsRes = {
  id: string;
  object: string;
  deleted: boolean;
};

export type AdminUploadsDownloadUrlRes = {
  download_url: string;
};

export * from "./create-upload";
export * from "./delete-upload";
