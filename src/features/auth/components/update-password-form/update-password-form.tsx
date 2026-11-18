"use client";

import { useTranslations } from "next-intl";
import { TextField } from "@/components/form/text-field";
import { Button } from "@/components/ui/button";
import { useActionForm } from "@/lib/forms/use-action-form";
import { updatePassword } from "../../actions";
import type { AuthErrorKey } from "../../auth-errors";
import {
  updatePasswordSchema,
  type UpdatePasswordInput,
  type UpdatePasswordState,
} from "../../update-password-schema";

const initialState: UpdatePasswordState = { status: "idle" };

export function UpdatePasswordForm({ email }: { email?: string }) {
  const t = useTranslations("UpdatePasswordForm");
  const tErrors = useTranslations("AuthErrors");

  const { form, formError, isPending, formProps } = useActionForm({
    action: updatePassword,
    initialState,
    schema: updatePasswordSchema,
    defaultValues: { password: "" },
  });

  const fieldError = (name: keyof UpdatePasswordInput) => {
    const key = form.formState.errors[name]?.message as
      AuthErrorKey | undefined;
    return key ? [tErrors(key)] : undefined;
  };

  return (
    <form {...formProps} aria-busy={isPending}>
      {/* Tells password managers which account the new password belongs to. */}
      {email && (
        <input
          type="text"
          name="username"
          autoComplete="username"
          value={email}
          readOnly
          hidden
        />
      )}
      <div className="mb-6 flex w-full flex-col gap-6">
        <TextField
          type="password"
          autoComplete="new-password"
          required
          label={t("passwordLabel")}
          placeholder={t("passwordPlaceholder")}
          description={t("passwordHint")}
          errors={fieldError("password")}
          {...form.register("password")}
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
