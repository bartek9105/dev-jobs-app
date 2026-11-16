import { z } from "zod";

/**
 * Wraps a Server Action body so it only ever runs with valid, typed data.
 *
 * Validation still happens on the server (a Server Action is a public endpoint, so the
 * form's checks can be skipped), just in one place instead of in every action.
 * Invalid input returns `{ status: "error", fieldErrors }`, using the schema's messages,
 * so the action's state type must include that shape.
 *
 * Not a "use server" file itself: those may only export async functions. Actions files
 * use it as `export const myAction = validatedAction(schema, async (data) => …)`.
 */
export function validatedAction<TSchema extends z.ZodObject, TState>(
  schema: TSchema,
  handler: (data: z.output<TSchema>) => Promise<TState>,
) {
  return async (
    _previousState: TState,
    formData: FormData,
  ): Promise<TState> => {
    // Unknown keys (like React's hidden $ACTION_ fields) are stripped by z.object.
    const parsed = schema.safeParse(Object.fromEntries(formData));

    if (!parsed.success) {
      return {
        status: "error",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
      } as TState;
    }

    return handler(parsed.data);
  };
}
