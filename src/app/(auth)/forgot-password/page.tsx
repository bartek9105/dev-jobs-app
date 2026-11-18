import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { HintLink } from "@/components/ui/hint-link";
import { ROUTES } from "@/config/routes";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form/forgot-password-form";
import { AuthPageShell } from "../_components/auth-page-shell/auth-page-shell";

export async function generateMetadata() {
  const t = await getTranslations("ForgotPasswordPage");
  return { title: t("title") };
}

export default function ForgotPasswordPage() {
  const t = useTranslations("ForgotPasswordPage");

  return (
    <AuthPageShell
      title={t("title")}
      description={t("description")}
      hint={t.rich("backToSignIn", {
        link: (chunks) => <HintLink href={ROUTES.signIn}>{chunks}</HintLink>,
      })}
    >
      <ForgotPasswordForm />
    </AuthPageShell>
  );
}
