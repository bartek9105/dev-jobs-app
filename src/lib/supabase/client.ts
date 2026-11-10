import { createBrowserClient } from "@supabase/ssr";
import { clientEnv } from "@/lib/env/client";
import type { Database } from "./database.types";

/**
 * For Client Components. Keeps the session in cookies (not localStorage), so the server
 * sees the same signed-in user. Returns a shared instance, so calling it often is cheap.
 */
export function createClient() {
  return createBrowserClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
