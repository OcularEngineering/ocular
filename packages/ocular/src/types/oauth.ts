import { AppNameDefinitions } from "@ocular/types";
import { App, OAuth } from "../models";

export type CreateOAuthInput = Omit<
  OAuth,
  | "id"
  | "last_sync"
  | "organisation_id"
  | "app_id"
  | "created_at"
  | "updated_at"
  | "deleted_at"
>;

export type UpdateOAuthInput = {
  token?: string;
  token_expires_at?: Date;
  refresh_token?: string;
  refresh_token_expires_at?: Date;
  last_sync?: Date;
  metadata?: Record<string, any>;
};

export type RetrieveOAuthConfig = {
  id: string;
  app_name: AppNameDefinitions;
};
