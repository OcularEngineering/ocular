import { AuthStrategy } from "./apps";

export type AuthToken = {
  type?: string;
  auth_strategy?: AuthStrategy;
  token?: string;
  token_expires_at?: Date;
  refresh_token?: string;
  refresh_token_expires_at?: Date;
  metadata?: Record<string, unknown>;
};
