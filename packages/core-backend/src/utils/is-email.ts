import { isEmail } from "class-validator"
import {AutoflowAiError} from "@ocular-ai/utils"

/**
 * Used to validate user email.
 * @param {string} email - email to validate
 * @return {string} the validated email
 */
export function validateEmail(email: string): string {
  const validatedEmail = isEmail(email)

  if (!validatedEmail) {
    throw new AutoflowAiError(
      AutoflowAiError.Types.INVALID_DATA,
      "The email is not valid"
    )
  }

  return email.toLowerCase()
}