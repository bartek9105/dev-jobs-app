import type { CurrentUser } from "./current-user";

/** How long after opening a reset link the user may set a new password. */
export const PASSWORD_RESET_WINDOW_SECONDS = 15 * 60;

/**
 * Whether this session may set a new password without the current one: only a session
 * that an email link created moments ago (Supabase records it as an "otp" sign-in).
 *
 * Without this, any signed-in session could reach /update-password, so someone using an
 * unlocked laptop, or a stolen session cookie, could take over the account by changing
 * its password. Following an email link proves control of the inbox right now.
 *
 * A sign-up confirmation link is also an "otp" sign-in. That's acceptable: it proves the
 * same thing, and the short window still applies.
 */
export function canSetNewPassword(
  user: CurrentUser | null,
  now: number = Date.now(),
): user is CurrentUser {
  const signIn = user?.lastSignIn;
  if (!signIn || signIn.method !== "otp") return false;

  const ageSeconds = now / 1000 - signIn.timestamp;
  return ageSeconds >= 0 && ageSeconds <= PASSWORD_RESET_WINDOW_SECONDS;
}
