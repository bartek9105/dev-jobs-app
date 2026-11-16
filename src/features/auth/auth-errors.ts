import type { Messages } from "next-intl";

/** Error messages shared by every auth form, as keys of the "AuthErrors" translations. */
export type AuthErrorKey = keyof Messages["AuthErrors"];

/** Zod params: the message is a translation key, so the form can show it in any language. */
export const authError = (key: AuthErrorKey) => ({ error: key });

/** Like authError, but stops checking the field, so empty shows only "required". */
export const requiredAuthError = (key: AuthErrorKey) => ({
  error: key,
  abort: true,
});

/** The error variant every auth form's state shares (validatedAction returns this shape). */
export type AuthFormError<TField extends string> = {
  status: "error";
  fieldErrors?: Partial<Record<TField, AuthErrorKey[]>>;
  formError?: AuthErrorKey;
};
