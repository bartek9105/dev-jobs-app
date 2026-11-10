import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { ROUTES } from "@/config/routes";
import { createClient } from "@/lib/supabase/server";

const allowedTypes = new Set<EmailOtpType>(["email", "signup"]);

/**
 * Target of the confirmation email link. A Route Handler, not a page: it only runs logic
 * (verify the token, set session cookies) and redirects. It always sends the user to a fixed
 * route rather than one from the URL, so the link can't be turned into an open redirect.
 */
export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type") as EmailOtpType | null;

  if (tokenHash && type && allowedTypes.has(type)) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) redirect(ROUTES.home);
  }

  redirect(ROUTES.authError);
}
