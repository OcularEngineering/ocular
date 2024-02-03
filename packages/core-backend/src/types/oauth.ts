import { OAuth} from "../models";


export type CreateOAuthInput = Omit<OAuth, "id" | "organisation_id" | "app_id" | "created_at" | "updated_at" | "deleted_at">

export type UpdateOAuthInput = {
  data: Record<string, unknown>
}