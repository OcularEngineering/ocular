import { App } from "../models";
import { PartialPick } from "./common";

// List Of Apps That Can Be Installed and Indexed In The Core Backend
export enum AppType {
  CORE_BACKEND = "core-backend",
}

export type CreateAppInput = Omit<App, "id" | "organisation" | "organisation_id" | "created_at" | "updated_at" | "deleted_at">


export type RegisterAppInput =  PartialPick<App,| "name"| "install_url"| "uninstall_url">