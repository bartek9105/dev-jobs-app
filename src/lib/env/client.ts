import { z } from "zod";

export const clientEnvSchema = z.object({
  // Any scheme is a valid URL ("localhost:3000" parses with scheme "localhost:"), so pin it.
  NEXT_PUBLIC_SITE_URL: z.url({ protocol: /^https?$/ }),
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
});
