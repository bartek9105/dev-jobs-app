"use client";

import { useTranslations } from "next-intl";
import { TextField } from "@/components/form/text-field";
import { Button } from "@/components/ui/button";
import { useActionForm } from "@/lib/forms/use-action-form";
import { signUp } from "../actions";
import {
  signUpSchema,
  type SignUpErrorKey,
  type SignUpInput,
  type SignUpState,
} from "../sign-up-schema";

const initialState: SignUpState = { status: "idle" };

export function SignUpForm() {
  const t = useTranslations("SignUpForm");
  const tFields = useTranslations("AuthFields");
  const { form, state, isPending, formProps } = useActionForm({
    action: signUp,
    initialState,
    schema: signUpSchema,
    defaultValues: { email: "", password: "" },
  });

  if (state.status === "success") {
    return (
      <div role="status" className="mb-6 flex flex-col gap-2">
        <p className="font-semibold text-heading">{t("success.title")}</p>
        <p className="text-sm text-muted-foreground">
          {t.rich("success.description", {
            email: state.email,
            strong: (chunks) => (
              <strong className="font-semibold text-foreground">
                {chunks}
              </strong>
            ),
          })}
        </p>
      </div>
    );
  }

  const fieldError = (name: keyof SignUpInput) => {
    const key = form.formState.errors[name]?.message as
      SignUpErrorKey | undefined;
    return key ? [t(`errors.${key}`)] : undefined;
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
          autoComplete="new-password"
          required
          label={tFields("passwordLabel")}
          placeholder={tFields("passwordPlaceholder")}
          description={t("passwordHint")}
          errors={fieldError("password")}
          {...form.register("password")}
        />
      </div>
      {state.status === "error" && state.formError && (
        <p role="alert" className="mb-4 text-sm text-destructive">
          {t(`errors.${state.formError}`)}
        </p>
      )}
      <Button type="submit" className="mb-6 w-full" disabled={isPending}>
        {isPending ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
