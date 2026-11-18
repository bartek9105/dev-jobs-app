import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { ROUTES } from "@/config/routes";
import { UpdatePasswordForm } from "@/features/auth/components/update-password-form/update-password-form";
import { getCurrentUser } from "@/lib/auth/current-user";
import { canSetNewPassword } from "@/lib/auth/password-reset";
import { AuthPageShell } from "../_components/auth-page-shell/auth-page-shell";

export async function generateMetadata() {
  const t = await getTranslations("UpdatePasswordPage");
  return { title: t("title") };
}

/**
 * Reached from a password reset link via /auth/confirm, which signed the user in.
 * The heading prerenders; the session check reads cookies, so it streams in behind
 * <Suspense> (with Cache Components, reading cookies outside a boundary is a build error).
 */
export default function UpdatePasswordPage() {
  const t = useTranslations("UpdatePasswordPage");

  return (
    <AuthPageShell title={t("title")}>
      <Suspense fallback={<FormSkeleton />}>
        <SignedInUpdatePasswordForm />
      </Suspense>
    </AuthPageShell>
  );
}

// The real guard: only a session a reset link created in the last few minutes may set a
// new password. Anything else (an expired or reused link, a page opened directly, an
// ordinary signed-in session) starts the reset flow over. The action checks again on submit.
async function SignedInUpdatePasswordForm() {
  // The check compares against the current time. Cache Components wants that marked as
  // request-time work explicitly; reading cookies alone doesn't count.
  await connection();
  const user = await getCurrentUser();
  if (!canSetNewPassword(user)) redirect(ROUTES.forgotPassword);

  return <UpdatePasswordForm email={user.email} />;
}

function FormSkeleton() {
  return (
    <div aria-hidden className="flex animate-pulse flex-col gap-3">
      <div className="h-4 w-28 rounded bg-muted" />
      <div className="h-10 rounded-md bg-muted" />
      <div className="mt-9 h-10 rounded-md bg-muted" />
    </div>
  );
}
