import { z } from "zod";
import { authError, requiredAuthError } from "./auth-errors";

/** Email as every auth form accepts it: trimmed, required, valid. */
export const emailField = z
  .string()
  .trim()
  .min(1, requiredAuthError("emailRequired"))
  .pipe(z.email(authError("emailInvalid")));

/**
 * The rules for choosing a password, shared by sign-up and "set a new password".
 * 72 is bcrypt's limit: Supabase would silently ignore anything longer.
 */
export const newPasswordField = z
  .string()
  .min(1, requiredAuthError("passwordRequired"))
  .min(8, authError("passwordTooShort"))
  .max(72, authError("passwordTooLong"));
