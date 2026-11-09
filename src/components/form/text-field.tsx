import { useId, type ComponentProps, type ReactNode } from "react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { PasswordInput } from "./password-input";

type TextFieldProps = ComponentProps<typeof Input> & {
  label: string;
  name: string;
  labelAction?: ReactNode;
  description?: string;
  errors?: string[];
};

export function TextField({
  label,
  labelAction,
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
    // A grid lets labelAction sit on the label's row while coming after the input in the
    // DOM, so Tab goes label → input → action instead of jumping to the link first.
    <Field
      data-invalid={isInvalid}
      className={cn("grid grid-cols-[1fr_auto] items-center", className)}
    >
      <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
      <div className="col-span-2">
        {type === "password" ? (
          <PasswordInput {...sharedProps} />
        ) : (
          <Input {...sharedProps} type={type} />
        )}
      </div>
      {labelAction && (
        <div className="col-start-2 row-start-1 flex">{labelAction}</div>
      )}
      {description && (
        <FieldDescription id={descriptionId} className="col-span-2">
          {description}
        </FieldDescription>
      )}
      {isInvalid && (
        <FieldError
          id={errorId}
          className="col-span-2"
          errors={errors.map((message) => ({ message }))}
        />
      )}
    </Field>
  );
}
