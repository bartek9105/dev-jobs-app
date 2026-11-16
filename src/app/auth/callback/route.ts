import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { ROUTES } from "@/config/routes";
import { createClient } from "@/lib/supabase/server";

/**
 * Where Supabase sends the user back after Google sign-in, with a one-time `code`.
 * Exchanging it (with the code verifier cookie set when the flow started) creates the
 * session. Like /auth/confirm it only ever redirects to fixed routes, so no `next`
 * parameter or forwarded host can turn it into an open redirect.
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  // No code means the user cancelled on Google's screen (?error=access_denied) or the
  // URL was tampered with: not worth logging, just show the error page.
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) redirect(ROUTES.home);
    console.error("Google sign-in: code exchange failed", error);
  }

  redirect(ROUTES.authError);
}
