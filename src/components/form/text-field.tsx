import { useId, type ComponentProps } from "react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "./password-input";

type TextFieldProps = ComponentProps<typeof Input> & {
  label: string;
  name: string;
  description?: string;
  /** Messages for this field, e.g. from `z.flattenError(error).fieldErrors.email`. */
  errors?: string[];
};

/**
 * Label + input + optional description and errors, wired together for screen readers.
 * `type="password"` gets a show/hide toggle.
 * `className` positions the whole field; style the input itself in `ui/input.tsx`.
 */
export function TextField({
  label,
  description,
  errors,
  id,
  type,
  className,
  ...inputProps
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptionId = `${inputId}-description`;
  const errorId = `${inputId}-error`;
  const isInvalid = errors !== undefined && errors.length > 0;

  const describedBy =
    [description && descriptionId, isInvalid && errorId]
      .filter(Boolean)
      .join(" ") || undefined;

  const sharedProps = {
    ...inputProps,
    id: inputId,
    "aria-invalid": isInvalid || undefined,
    "aria-describedby": describedBy,
  };

  return (
    <Field data-invalid={isInvalid} className={className}>
      <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
      {type === "password" ? (
        <PasswordInput {...sharedProps} />
      ) : (
        <Input {...sharedProps} type={type} />
      )}
      {description && (
        <FieldDescription id={descriptionId}>{description}</FieldDescription>
      )}
      {isInvalid && (
        <FieldError
          id={errorId}
          errors={errors.map((message) => ({ message }))}
        />
      )}
    </Field>
  );
}
