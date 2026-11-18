import { z } from "zod";
import type { AuthFormError } from "./auth-errors";
import { emailField } from "./auth-fields";

export const forgotPasswordSchema = z.object({
  email: emailField,
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export type ForgotPasswordState =
  | { status: "idle" }
  | AuthFormError<keyof ForgotPasswordInput>
  | { status: "success"; email: string };
