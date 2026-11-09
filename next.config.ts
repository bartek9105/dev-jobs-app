import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Validate env at config load so `next dev` / `next build` fail fast on a bad .env,
// instead of at the first request that happens to read the variable.
import "./src/lib/env/client";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  typedRoutes: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
