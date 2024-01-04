import { UserRoles } from "../models/user"
import { CreateOrganisationInput } from "./organisation"

export interface CreateUserInput {
  id?: string
  email: string
  first_name?: string
  last_name?: string
  api_token?: string
  role?: UserRoles
  metadata?: Record<string, unknown>
  organisation?: CreateOrganisationInput
}

export interface UpdateUserInput {
  readonly email?: string
  first_name?: string
  last_name?: string
  readonly password_hash?: string
  api_token?: string
  role?: UserRoles
  metadata?: Record<string, unknown>
}

export enum UserRole {
  MEMBER = "member",
  ADMIN = "admin"
}

// export type FilterableUserProps = PartialPick<
//   User,
//   | "email"
//   | "first_name"
//   | "last_name"
//   | "created_at"
//   | "updated_at"
//   | "deleted_at"
// >