"use server";

import { isAuthApiError } from "@supabase/supabase-js";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  signUpSchema,
  type SignUpErrorKey,
  type SignUpState,
} from "./sign-up-schema";

const supabaseErrorKeys: Partial<Record<string, SignUpErrorKey>> = {
  weak_password: "weakPassword",
  email_address_invalid: "emailInvalid",
  over_email_send_rate_limit: "rateLimited",
  over_request_rate_limit: "rateLimited",
};

const accountExistsCodes = new Set(["user_already_exists", "email_exists"]);

export async function signUp(
  _previousState: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const email = String(formData.get("email") ?? "");
  const parsed = signUpSchema.safeParse({
    email,
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    return {
      status: "error",
      email,
      fieldErrors: z.flattenError(parsed.error).fieldErrors as Partial<
        Record<"email" | "password", SignUpErrorKey[]>
      >,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp(parsed.data);

  if (
    error &&
    !(isAuthApiError(error) && accountExistsCodes.has(error.code ?? ""))
  ) {
    const known = isAuthApiError(error)
      ? supabaseErrorKeys[error.code ?? ""]
      : undefined;
    if (!known) console.error("Sign-up failed", error);

    return {
      status: "error",
      email: parsed.data.email,
      ...(known === "weakPassword"
        ? { fieldErrors: { password: [known] } }
        : { formError: known ?? "generic" }),
    };
  }

  return { status: "success", email: parsed.data.email };
}
