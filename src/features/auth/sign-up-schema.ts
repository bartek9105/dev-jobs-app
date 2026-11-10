import type { Messages } from "next-intl";
import { z } from "zod";

export type SignUpErrorKey = keyof Messages["SignUpForm"]["errors"];

const error = (key: SignUpErrorKey) => ({ error: key });
const required = (key: SignUpErrorKey) => ({ error: key, abort: true });

export const signUpSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, required("emailRequired"))
    .pipe(z.email(error("emailInvalid"))),
  password: z
    .string()
    .min(1, required("passwordRequired"))
    .min(8, error("passwordTooShort"))
    .max(72, error("passwordTooLong")),
});

export type SignUpInput = z.infer<typeof signUpSchema>;

export type SignUpState =
  | { status: "idle" }
  | {
      status: "error";
      email: string;
      fieldErrors?: Partial<Record<keyof SignUpInput, SignUpErrorKey[]>>;
      formError?: SignUpErrorKey;
    }
  | { status: "success"; email: string };
