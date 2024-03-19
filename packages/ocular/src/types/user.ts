import { User } from "../models/user"
import { UserRoles } from "@ocular/types"
import { PartialPick } from "../types/common"
import { CreateOrganisationInput } from "./organisation"

export interface CreateUserInput {
  id?: string
  email: string
  first_name?: string
  last_name?: string
  api_token?: string
  role?: UserRoles
  metadata?: Record<string, unknown>
  organisation_id?: string
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

export type FilterableUserProps = PartialPick<
  User,
  | "id"
  | "email"
  | "first_name"
  | "last_name"
  | "created_at"
  | "updated_at"
  | "organisation_id"
>