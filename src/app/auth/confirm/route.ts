import type { EmailOtpType } from "@supabase/supabase-js";
import type { Route } from "next";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { ROUTES } from "@/config/routes";
import { createClient } from "@/lib/supabase/server";

// Where each kind of email link leads after the token is verified. Types without an entry
// are rejected, so adding a new email flow is a deliberate change here.
const destinations: Partial<Record<EmailOtpType, Route>> = {
  email: ROUTES.home,
  signup: ROUTES.home,
  recovery: ROUTES.updatePassword,
};

/**
 * Target of every email link (sign-up confirmation, password reset). A Route Handler, not a
 * page: it only runs logic (verify the token, set session cookies) and redirects. The
 * destination comes from the token type, never from the URL, so the link can't be turned
 * into an open redirect.
 */
export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type") as EmailOtpType | null;
  const destination = type ? destinations[type] : undefined;

  if (tokenHash && type && destination) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) redirect(destination);
  }

  redirect(ROUTES.authError);
}
