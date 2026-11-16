import { z } from "zod";
import {
  authError,
  requiredAuthError,
  type AuthFormError,
} from "./auth-errors";

export const signUpSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, requiredAuthError("emailRequired"))
    .pipe(z.email(authError("emailInvalid"))),
  // 72 is bcrypt's limit: Supabase would silently ignore anything longer.
  password: z
    .string()
    .min(1, requiredAuthError("passwordRequired"))
    .min(8, authError("passwordTooShort"))
    .max(72, authError("passwordTooLong")),
});

export type SignUpInput = z.infer<typeof signUpSchema>;

export type SignUpState =
  | { status: "idle" }
  | AuthFormError<keyof SignUpInput>
  | { status: "success"; email: string };
