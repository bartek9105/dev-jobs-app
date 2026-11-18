"use client";

import { useTranslations } from "next-intl";
import { TextField } from "@/components/form/text-field";
import { Button } from "@/components/ui/button";
import { useActionForm } from "@/lib/forms/use-action-form";
import { requestPasswordReset } from "../../actions";
import type { AuthErrorKey } from "../../auth-errors";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
  type ForgotPasswordState,
} from "../../forgot-password-schema";

const initialState: ForgotPasswordState = { status: "idle" };

export function ForgotPasswordForm() {
  const t = useTranslations("ForgotPasswordForm");
  const tFields = useTranslations("AuthFields");
  const tErrors = useTranslations("AuthErrors");

  const { form, state, formError, isPending, formProps } = useActionForm({
    action: requestPasswordReset,
    initialState,
    schema: forgotPasswordSchema,
    defaultValues: { email: "" },
  });

  if (state.status === "success") {
    return (
      <div role="status" className="flex flex-col gap-2">
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

  const fieldError = (name: keyof ForgotPasswordInput) => {
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
      </div>
      {formError && (
        <p role="alert" className="mb-4 text-sm text-destructive">
          {tErrors(formError)}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
