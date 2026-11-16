import { z } from "zod";
import {
  authError,
  requiredAuthError,
  type AuthFormError,
} from "./auth-errors";

// Only "is it filled in" for the password: sign-in must keep working for accounts created
// under older or different password rules, and shouldn't hint at what those rules are.
export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, requiredAuthError("emailRequired"))
    .pipe(z.email(authError("emailInvalid"))),
  password: z.string().min(1, authError("passwordRequired")),
});

export type SignInInput = z.infer<typeof signInSchema>;

// No success state: a successful sign-in redirects instead of returning.
export type SignInState = { status: "idle" } | AuthFormError<keyof SignInInput>;
