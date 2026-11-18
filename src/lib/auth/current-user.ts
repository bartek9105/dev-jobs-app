import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type CurrentUser = {
  id: string;
  email?: string;
  /**
   * How and when this session was last authenticated, from the token's `amr` claim:
   * "password", "oauth", or "otp" for an email link (sign-up confirmation, password reset).
   * The timestamp is in seconds, as in the JWT. Token refreshes keep it unchanged.
   */
  lastSignIn: { method: string; timestamp: number } | null;
};

/**
 * The signed-in user, or null. Part of the Data Access Layer: pages and Server Actions
 * that need a user check it here, next to the data, rather than relying on the proxy.
 *
 * getClaims() verifies the session token (unlike getSession(), which trusts the cookie).
 * React's cache() dedupes it, so several components can ask within one request for free.
 * Reads cookies, so callers render dynamically: keep them inside <Suspense>.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) return null;

  return {
    id: data.claims.sub,
    email:
      typeof data.claims.email === "string" ? data.claims.email : undefined,
    lastSignIn: latestSignIn(data.claims.amr),
  };
});

// `amr` can list several methods (e.g. password, then an MFA step); the latest one is the
// sign-in that produced this session. The older string[] form carries no time, so skip it.
function latestSignIn(amr: unknown): CurrentUser["lastSignIn"] {
  if (!Array.isArray(amr)) return null;

  let latest: CurrentUser["lastSignIn"] = null;
  for (const entry of amr) {
    if (
      typeof entry?.method === "string" &&
      typeof entry?.timestamp === "number" &&
      (!latest || entry.timestamp > latest.timestamp)
    ) {
      latest = { method: entry.method, timestamp: entry.timestamp };
    }
  }
  return latest;
}
