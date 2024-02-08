export interface createEntitiesInput {
  id?: string
  email: string
  first_name?: string
  last_name?: string
  api_token?: string
  metadata?: Record<string, unknown>
}