import { z } from "zod";
import type { AuthFormError } from "./auth-errors";
import { emailField, newPasswordField } from "./auth-fields";

export const signUpSchema = z.object({
  email: emailField,
  password: newPasswordField,
});

export type SignUpInput = z.infer<typeof signUpSchema>;

export type SignUpState =
  | { status: "idle" }
  | AuthFormError<keyof SignUpInput>
  | { status: "success"; email: string };
