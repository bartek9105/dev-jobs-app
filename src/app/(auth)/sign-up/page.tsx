import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { FieldSeparator } from "@/components/ui/field";
import { HintLink } from "@/components/ui/hint-link";
import { ROUTES } from "@/config/routes";
import { GoogleSignInButton } from "@/features/auth/components/google-sign-in-button/google-sign-in-button";
import { SignUpForm } from "@/features/auth/components/sign-up-form/sign-up-form";
import { AuthPageShell } from "../_components/auth-page-shell/auth-page-shell";

export async function generateMetadata() {
  const t = await getTranslations("SignUpPage");
  return { title: t("title") };
}

export default function SignUpPage() {
  const t = useTranslations("SignUpPage");

  return (
    <AuthPageShell
      title={t("title")}
      hint={t.rich("haveAccount", {
        link: (chunks) => <HintLink href={ROUTES.signIn}>{chunks}</HintLink>,
      })}
      alternative={
        <div className="flex flex-col gap-4">
          <FieldSeparator>{t("or")}</FieldSeparator>
          <GoogleSignInButton
            label={t("google")}
            pendingLabel={t("googlePending")}
          />
        </div>
      }
    >
      <SignUpForm />
    </AuthPageShell>
  );
}
