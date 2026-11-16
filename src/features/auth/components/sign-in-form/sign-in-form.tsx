"use client";

import { useTranslations } from "next-intl";
import { TextField } from "@/components/form/text-field";
import { Button } from "@/components/ui/button";
import { HintLink } from "@/components/ui/hint-link";
import { ROUTES } from "@/config/routes";
import { useActionForm } from "@/lib/forms/use-action-form";
import { signIn } from "../../actions";
import type { AuthErrorKey } from "../../auth-errors";
import {
  signInSchema,
  type SignInInput,
  type SignInState,
} from "../../sign-in-schema";

const initialState: SignInState = { status: "idle" };

export function SignInForm() {
  const t = useTranslations("SignInForm");
  const tFields = useTranslations("AuthFields");
  const tErrors = useTranslations("AuthErrors");

  const { form, formError, isPending, formProps } = useActionForm({
    action: signIn,
    initialState,
    schema: signInSchema,
    defaultValues: { email: "", password: "" },
  });

  const fieldError = (name: keyof SignInInput) => {
    const key = form.formState.errors[name]?.message as
      AuthErrorKey | undefined;
    return key ? [tErrors(key)] : undefined;
  };

  return (
    <form {...formProps} aria-busy={isPending}>
      <div className="mb-6 flex w-full flex-col gap-6">
        <TextField
          type="email"
          autoComplete="email"
          required
          label={tFields("emailLabel")}
          placeholder={tFields("emailPlaceholder")}
          errors={fieldError("email")}
          {...form.register("email")}
        />
        <TextField
          type="password"
          autoComplete="current-password"
          required
          label={tFields("passwordLabel")}
          placeholder={tFields("passwordPlaceholder")}
          labelAction={
            <HintLink href={ROUTES.forgotPassword}>
              {t("forgotPassword")}
            </HintLink>
          }
          errors={fieldError("password")}
          {...form.register("password")}
        />
      </div>
      {formError && (
        <p role="alert" className="mb-4 text-sm text-destructive">
          {tErrors(formError)}
        </p>
      )}
      <Button type="submit" className="mb-6 w-full" disabled={isPending}>
        {isPending ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
