import { z } from "zod";

export const clientEnvSchema = z.object({
  // Any scheme is a valid URL ("localhost:3000" parses with scheme "localhost:"), so pin it.
  NEXT_PUBLIC_SITE_URL: z.url({ protocol: /^https?$/ }),
  NEXT_PUBLIC_SUPABASE_URL: z.url({ protocol: /^https?$/ }),
  // Safe to expose: Row Level Security, not this key, decides what data a request can reach.
  // The prefix check stops a secret key (sb_secret_…) from being pasted here and shipped
  // to every browser.
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .startsWith("sb_publishable_"),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;

export function parseClientEnv(
  input: Record<keyof ClientEnv, unknown>,
): ClientEnv {
  const result = clientEnvSchema.safeParse(input);
  if (!result.success) {
    throw new Error(
      `Invalid public environment variables:\n${z.prettifyError(result.error)}`,
    );
  }
  return result.data;
}

// Every NEXT_PUBLIC_ variable must be read by its full literal name. Next.js inlines
// them into the client bundle at build time by text replacement, so a dynamic lookup
// like `process.env[key]` would be undefined in the browser.
export const clientEnv = parseClientEnv({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
});
