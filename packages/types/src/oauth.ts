import { AppAuthStrategy } from "./apps";

export type OAuthToken = {
  type?: string;
  auth_strategy?: AppAuthStrategy;
  token?: string;
  token_expires_at?: Date;
  refresh_token?: string;
  refresh_token_expires_at?: Date;
  metadata?: Record<string, unknown>;
};
