import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { clientEnv } from "@/lib/env/client";
import type { Database } from "./database.types";

/**
 * For Server Components, Server Actions and Route Handlers. Create one per request:
 * it's bound to that request's cookies. Reading cookies makes the route dynamic, so
 * don't use this for public data that should stay cached.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Server Components can't set cookies. That's fine: the proxy refreshes the
            // session on every request, and Server Actions (which can) succeed here.
          }
        },
      },
    },
  );
}
