"use server";

import { isAuthApiError } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { ROUTES } from "@/config/routes";
import { validatedAction } from "@/lib/forms/validated-action";
import { createClient } from "@/lib/supabase/server";
import type { AuthErrorKey } from "./auth-errors";
import { signInSchema, type SignInState } from "./sign-in-schema";
import { signUpSchema, type SignUpState } from "./sign-up-schema";

const signUpErrorKeys: Partial<Record<string, AuthErrorKey>> = {
  weak_password: "weakPassword",
  email_address_invalid: "emailInvalid",
  over_email_send_rate_limit: "rateLimited",
  over_request_rate_limit: "rateLimited",
};

const signInErrorKeys: Partial<Record<string, AuthErrorKey>> = {
  invalid_credentials: "invalidCredentials",
  // Does reveal that the account exists, but a vague error here would leave real users
  // stuck with no idea they need to confirm their email first.
  email_not_confirmed: "emailNotConfirmed",
  over_request_rate_limit: "rateLimited",
};

// Treated like success, so the form never reveals whether an email is already registered.
const accountExistsCodes = new Set(["user_already_exists", "email_exists"]);

export const signUp = validatedAction(
  signUpSchema,
  async (data): Promise<SignUpState> => {
    const supabase = await createClient();
    const { error } = await supabase.auth.signUp(data);

    if (
      error &&
      !(isAuthApiError(error) && accountExistsCodes.has(error.code ?? ""))
    ) {
      const known = isAuthApiError(error)
        ? signUpErrorKeys[error.code ?? ""]
        : undefined;
      if (!known) console.error("Sign-up failed", error);

      return known === "weakPassword"
        ? { status: "error", fieldErrors: { password: [known] } }
        : { status: "error", formError: known ?? "generic" };
    }

    return { status: "success", email: data.email };
  },
);

export const signIn = validatedAction(
  signInSchema,
  async (data): Promise<SignInState> => {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword(data);

    if (error) {
      const known = isAuthApiError(error)
        ? signInErrorKeys[error.code ?? ""]
        : undefined;
      if (!known) console.error("Sign-in failed", error);

      // A form-level message, never "wrong password" on one field: pointing at a field
      // would tell an attacker which part was right, i.e. that the email has an account.
      return { status: "error", formError: known ?? "generic" };
    }

    // Outside any try/catch: redirect() works by throwing. The session cookies set above
    // travel with this redirect, so the next page already renders signed in.
    redirect(ROUTES.home);
  },
);
