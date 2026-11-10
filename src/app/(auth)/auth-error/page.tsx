import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Heading } from "@/components/ui/heading";
import { HintLink } from "@/components/ui/hint-link";
import { ROUTES } from "@/config/routes";

export async function generateMetadata() {
  const t = await getTranslations("AuthErrorPage");
  return { title: t("title") };
}

export default function AuthErrorPage() {
  const t = useTranslations("AuthErrorPage");

  return (
    <>
      <Heading level={1} variant="h1" className="mb-4">
        {t("title")}
      </Heading>
      <p className="mb-6 text-sm text-muted-foreground">{t("description")}</p>
      <HintLink href={ROUTES.signUp}>{t("action")}</HintLink>
    </>
  );
}
