import type { Route } from "next";

export const ROUTES = {
  home: "/",
  signIn: "/sign-in",
  signUp: "/sign-up",
  forgotPassword: "/forgot-password",
  authError: "/auth-error",
  authCallback: "/auth/callback",
  updatePassword: "/update-password",
} as const satisfies Record<string, Route>;

/**
 * The page of one offer. typedRoutes only checks literal hrefs, so a built one needs a
 * cast; keeping it in one place means a renamed route is fixed here, not in every link.
 */
export function offerRoute(slug: string): Route {
  return `/offers/${encodeURIComponent(slug)}` as Route;
}
