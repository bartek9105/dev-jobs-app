import Image from "next/image";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { FieldSeparator } from "@/components/ui/field";
import { Heading } from "@/components/ui/heading";
import { HintLink } from "@/components/ui/hint-link";
import { ROUTES } from "@/config/routes";
import { SignInForm } from "@/features/auth/components/sign-in-form/sign-in-form";

export async function generateMetadata() {
  const t = await getTranslations("SignInPage");
  return { title: t("title") };
}

export default function SignInPage() {
  const t = useTranslations("SignInPage");

  return (
    <>
      <Heading level={1} variant="h1" className="mb-10">
        {t("title")}
      </Heading>
      <SignInForm />

      <p className="mb-6 text-sm font-medium text-muted-foreground">
        {t.rich("noAccount", {
          link: (chunks) => <HintLink href={ROUTES.signUp}>{chunks}</HintLink>,
        })}
      </p>

      <div className="flex flex-col gap-4">
        <FieldSeparator>{t("or")}</FieldSeparator>
        <Button variant="outline" className="w-full">
          <Image
            src="/icons/google.svg"
            alt=""
            width={16}
            height={16}
            data-icon="inline-start"
          />
          {t("google")}
        </Button>
      </div>
    </>
  );
}
