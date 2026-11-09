import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Heading } from "@/components/ui/heading";

export async function generateMetadata() {
  const t = await getTranslations("ForgotPasswordPage");
  return { title: t("title") };
}

export default function ForgotPassword() {
  const t = useTranslations("ForgotPasswordPage");

  return (
    <Heading level={1} variant="h1">
      {t("title")}
    </Heading>
  );
}
