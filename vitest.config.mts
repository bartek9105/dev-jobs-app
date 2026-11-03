import nextEnv from "@next/env";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// @next/env is CommonJS, so named imports don't work from this ESM config.
const { loadEnvConfig } = nextEnv;

// Load .env files exactly like Next.js does. With NODE_ENV=test that means
// .env.test(.local) and .env, but NOT .env.local, so tests are reproducible.
loadEnvConfig(process.cwd());

export default defineConfig({
  plugins: [react()],
  // Resolves the "@/*" alias from tsconfig.json, so tests import like app code does.
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
