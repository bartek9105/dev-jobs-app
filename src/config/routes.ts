import type { Route } from "next";

export const ROUTES = {
  home: "/",
  signIn: "/sign-in",
  signUp: "/sign-up",
  forgotPassword: "/forgot-password",
  authError: "/auth-error",
} as const satisfies Record<string, Route>;
