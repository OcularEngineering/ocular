import { User } from "../models"

export type AuthenticateResult = {
  success: boolean
  user?: User
  error?: string
}