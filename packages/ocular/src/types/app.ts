import { App } from "../models";
import { PartialPick } from "./common";

export type RegisterAppInput = Omit<App, "id" | "organisation" | "organisation_id" | "created_at" | "updated_at" | "deleted_at">