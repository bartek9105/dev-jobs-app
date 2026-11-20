import "server-only";
import { createClient } from "@supabase/supabase-js";
import { clientEnv } from "@/lib/env/client";
import type { Database } from "./database.types";

/**
 * For public data that's the same for every visitor, inside `"use cache"` functions
 * (only there: its requests aren't cached on their own).
 * It reads no cookies and has no session, so it queries as the `anon` role: RLS returns
 * exactly what a signed-out visitor may see, whoever triggered the render.
 *
 * Use the cookie-based server client instead for anything that depends on who's signed in.
 * That one can't run inside `"use cache"`, which forbids reading cookies.
 */
export function createPublicClient() {
  return createClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        // Next.js would also store these responses in its own fetch cache, untagged and
        // kept across builds, so revalidateTag() on the calling "use cache" function would
        // rerun it and still get the old response. The "use cache" function is the one
        // cache layer: its tags and lifetime decide when data refreshes.
        fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
      },
    },
  );
}
