import { zodResolver } from "@hookform/resolvers/zod";
import {
  startTransition,
  useActionState,
  useMemo,
  useSyncExternalStore,
} from "react";
import {
  useForm,
  type DefaultValues,
  type FieldErrors,
  type FieldValues,
  type Resolver,
} from "react-hook-form";
import type { z } from "zod";

/** What a form's Server Action returns: field errors use the form's field names. */
export type FormActionState = {
  status: string;
  fieldErrors?: Partial<Record<string, string[]>>;
};

type UseActionFormOptions<
  TSchema extends z.ZodType<FieldValues, FieldValues>,
  TState extends FormActionState,
> = {
  // Awaited<> mirrors useActionState's own signature, so generic states type-check.
  action: (state: Awaited<TState>, formData: FormData) => Promise<TState>;
  initialState: Awaited<TState>;
  /** The same schema the action validates with: here it gives instant feedback. */
  schema: TSchema;
  defaultValues: DefaultValues<z.input<TSchema>>;
};

/**
 * React Hook Form + a Server Action, used the same way by every form in the app:
 * - RHF validates on submit, then again on every change, so errors clear as the user types
 *   and an invalid form never sends a request.
 * - The Server Action still validates (it's a public endpoint) and its field errors are
 *   shown through RHF, so they clear the same way.
 * - Before hydration the form posts natively to the action, with the browser's own
 *   `required` checks; once React has loaded, RHF takes over.
 */
export function useActionForm<
  TSchema extends z.ZodType<FieldValues, FieldValues>,
  TState extends FormActionState,
>({
  action,
  initialState,
  schema,
  defaultValues,
}: UseActionFormOptions<TSchema, TState>) {
  const [state, formAction, isPending] = useActionState<TState, FormData>(
    action,
    initialState,
  );

  // New object only when a new result arrives: RHF re-applies `errors` when it changes,
  // so recomputing it on every render would bring back errors the user just fixed.
  const serverErrors = useMemo(
    () => toFieldErrors<z.input<TSchema>>(state.fieldErrors),
    [state],
  );

  const form = useForm<z.input<TSchema>, unknown, z.output<TSchema>>({
    // zodResolver's overloads can't be resolved for a generic schema; callers stay fully
    // typed because input/output come from their concrete schema.
    resolver: zodResolver(schema as never) as Resolver<
      z.input<TSchema>,
      unknown,
      z.output<TSchema>
    >,
    defaultValues,
    errors: serverErrors,
  });

  const onSubmit = form.handleSubmit((_values, event) => {
    const formData = new FormData(event?.target as HTMLFormElement);
    startTransition(() => formAction(formData));
  });

  const isHydrated = useIsHydrated();

  return {
    form,
    state,
    isPending,
    formProps: {
      action: formAction,
      onSubmit,
      // Native validation until hydration, RHF's after. Toggling it this way avoids a
      // hydration mismatch, since the first client render matches the server's.
      noValidate: isHydrated,
    },
  };
}

function toFieldErrors<TValues extends FieldValues>(
  fieldErrors: FormActionState["fieldErrors"],
) {
  if (!fieldErrors) return undefined;

  return Object.fromEntries(
    Object.entries(fieldErrors).flatMap(([name, messages]) =>
      messages?.[0] ? [[name, { type: "server", message: messages[0] }]] : [],
    ),
  ) as FieldErrors<TValues>;
}

const subscribe = () => () => {};

/** false while rendering on the server and during hydration, true afterwards. */
function useIsHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
