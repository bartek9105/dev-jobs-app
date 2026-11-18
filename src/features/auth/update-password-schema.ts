import { z } from "zod";
import type { AuthFormError } from "./auth-errors";
import { newPasswordField } from "./auth-fields";

export const updatePasswordSchema = z.object({
  password: newPasswordField,
});

export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;

// No success state: a successful update redirects instead of returning.
export type UpdatePasswordState =
  { status: "idle" } | AuthFormError<keyof UpdatePasswordInput>;
