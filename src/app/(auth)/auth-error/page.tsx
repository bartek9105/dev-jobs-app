import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { HintLink } from "@/components/ui/hint-link";
import { ROUTES } from "@/config/routes";
import { AuthPageShell } from "../_components/auth-page-shell/auth-page-shell";

export async function generateMetadata() {
  const t = await getTranslations("AuthErrorPage");
  return { title: t("title") };
}

export default function AuthErrorPage() {
  const t = useTranslations("AuthErrorPage");

  return (
    <AuthPageShell
      title={t("title")}
      description={t("description")}
      hint={<HintLink href={ROUTES.signIn}>{t("action")}</HintLink>}
    />
  );
}
