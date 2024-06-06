import { AppNameDefinitions } from "@ocular/types";
import { App, AppAuthorization } from "../models";

export type CreateAuthInput = Omit<
  AppAuthorization,
  | "id"
  | "last_sync"
  | "organisation_id"
  | "app_id"
  | "created_at"
  | "updated_at"
  | "deleted_at"
>;

export type UpdateAuthInput = {
  token?: string;
  token_expires_at?: Date;
  refresh_token?: string;
  refresh_token_expires_at?: Date;
  last_sync?: Date;
  metadata?: Record<string, any>;
};

export type RetrieveAuthConfig = {
  id: string;
  app_name: AppNameDefinitions;
};
