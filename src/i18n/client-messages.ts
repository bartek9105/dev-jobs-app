import type { Messages } from "next-intl";

/**
 * Namespaces used by Client Components. Only these are sent to the browser; the rest stay
 * on the server. client-messages.test.ts fails if a "use client" file uses one not listed.
 */
export const CLIENT_NAMESPACES = [
  "AuthErrors",
  "AuthFields",
  "PasswordInput",
  "SignInForm",
  "SignUpForm",
  "ForgotPasswordForm",
  "UpdatePasswordForm",
  "ErrorPage",
] as const satisfies ReadonlyArray<keyof Messages>;

export function pickClientMessages(messages: Messages) {
  return Object.fromEntries(
    CLIENT_NAMESPACES.map((namespace) => [namespace, messages[namespace]]),
  ) as Pick<Messages, (typeof CLIENT_NAMESPACES)[number]>;
}
