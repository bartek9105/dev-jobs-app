import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { clientEnv } from "@/lib/env/client";
import type { Database } from "./database.types";

/**
 * Refreshes an expiring session before the page renders. Server Components can't write
 * cookies, so without this a user would get signed out once their access token expires.
 *
 * This only keeps the session fresh. It is NOT the place to protect pages or data: check
 * the user next to the data (and in every Server Action), with Row Level Security under it.
 */
export async function updateSession(request: NextRequest) {
  // Anonymous visitors have nothing to refresh; skip the work on most job board traffic.
  if (!request.cookies.getAll().some(({ name }) => name.startsWith("sb-"))) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet, headers) {
          // On the request, so Server Components rendering now see the new tokens…
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          // …and on the response, so the browser stores them.
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
          // no-store headers: a cached response must never hand one user's session to another.
          for (const [key, value] of Object.entries(headers)) {
            response.headers.set(key, value);
          }
        },
      },
    },
  );

  // Verifies the token and refreshes it if needed. Keep nothing between creating the client
  // and this call, and always return `response`: dropping its cookies signs the user out.
  await supabase.auth.getClaims();

  return response;
}
