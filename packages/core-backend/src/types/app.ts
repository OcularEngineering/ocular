import { App } from "../models";
import { PartialPick } from "./common";

export type CreateAppInput = Omit<App, "id" | "organisation" | "organisation_id" | "created_at" | "updated_at" | "deleted_at">


export type RegisterAppInput =  PartialPick<App,| "name"| "install_url"| "uninstall_url">