export type OAuthToken = {
  type?: string
  token?: string
  token_expires_at?: Date
  refresh_token?: string
  refresh_token_expires_at?: Date
  metadata?: Record<string, unknown>
}