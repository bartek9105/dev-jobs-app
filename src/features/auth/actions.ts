"use server";

import { isAuthApiError } from "@supabase/supabase-js";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { ROUTES } from "@/config/routes";
import { getCurrentUser } from "@/lib/auth/current-user";
import { canSetNewPassword } from "@/lib/auth/password-reset";
import { clientEnv } from "@/lib/env/client";
import { validatedAction } from "@/lib/forms/validated-action";
import { createClient } from "@/lib/supabase/server";
import type { AuthErrorKey } from "./auth-errors";
import {
  forgotPasswordSchema,
  type ForgotPasswordState,
} from "./forgot-password-schema";
import { signInSchema, type SignInState } from "./sign-in-schema";
import { signUpSchema, type SignUpState } from "./sign-up-schema";
import {
  updatePasswordSchema,
  type UpdatePasswordState,
} from "./update-password-schema";

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

const passwordResetErrorKeys: Partial<Record<string, AuthErrorKey>> = {
  // Supabase allows one reset email per user per 60 seconds.
  over_email_send_rate_limit: "rateLimited",
  over_request_rate_limit: "rateLimited",
  email_address_invalid: "emailInvalid",
};

const updatePasswordErrorKeys: Partial<Record<string, AuthErrorKey>> = {
  weak_password: "weakPassword",
  same_password: "samePassword",
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

/**
 * Step 1 of "forgot password": email a recovery link. The link (see the recovery email
 * template) goes to /auth/confirm, which signs the user in and sends them to set a new
 * password.
 */
export const requestPasswordReset = validatedAction(
  forgotPasswordSchema,
  async (data): Promise<ForgotPasswordState> => {
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(data.email);

    if (error) {
      const known = isAuthApiError(error)
        ? passwordResetErrorKeys[error.code ?? ""]
        : undefined;
      if (!known) console.error("Password reset request failed", error);

      return { status: "error", formError: known ?? "generic" };
    }

    // Supabase reports success for unknown emails too, and so does the form ("if an account
    // exists…"), so it can't be used to find out who has an account.
    return { status: "success", email: data.email };
  },
);

/**
 * Step 2: set the new password. Needs the session the recovery link created, checked here
 * as well as on the page, because a Server Action is a public endpoint of its own.
 */
export const updatePassword = validatedAction(
  updatePasswordSchema,
  async (data): Promise<UpdatePasswordState> => {
    // Not just "signed in": the session must come from a reset link opened moments ago,
    // or a stolen session could change the password and lock the owner out.
    const user = await getCurrentUser();
    if (!canSetNewPassword(user)) {
      return { status: "error", formError: "sessionExpired" };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (error) {
      const known = isAuthApiError(error)
        ? updatePasswordErrorKeys[error.code ?? ""]
        : undefined;
      if (!known) console.error("Password update failed", error);

      return known === "weakPassword" || known === "samePassword"
        ? { status: "error", fieldErrors: { password: [known] } }
        : { status: "error", formError: known ?? "generic" };
    }

    redirect(ROUTES.home);
  },
);

/**
 * Signs a user in, or up, with Google. Supabase returns Google's consent URL and stores the
 * PKCE code verifier in a cookie (which only a Server Action or Route Handler can write);
 * Google then sends the user back via Supabase to our /auth/callback route.
 */
export const signInWithGoogle = async () => {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      // Must exactly match an entry in Supabase's redirect allow list.
      redirectTo: new URL(
        ROUTES.authCallback,
        clientEnv.NEXT_PUBLIC_SITE_URL,
      ).toString(),
    },
  });

  if (error || !data.url) {
    console.error("Google sign-in failed to start", error);
    redirect(ROUTES.authError);
  }

  // Google's consent page: an external URL, which typedRoutes (our own routes only) can't check.
  redirect(data.url as Route);
};
