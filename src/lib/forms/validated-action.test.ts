import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { validatedAction } from "./validated-action";

const schema = z.object({
  email: z.string().trim().pipe(z.email("emailInvalid")),
  age: z.coerce.number().min(18, "tooYoung"),
});

const formData = (fields: Record<string, string>) => {
  const data = new FormData();
  for (const [name, value] of Object.entries(fields)) data.set(name, value);
  return data;
};

type State = { status: string };

describe("validatedAction", () => {
  it("returns field errors and never runs the handler for invalid input", async () => {
    const handler = vi.fn();
    const action = validatedAction(schema, handler);

    const state = await action(
      { status: "idle" },
      formData({ email: "nope", age: "12" }),
    );

    expect(state).toEqual({
      status: "error",
      fieldErrors: { email: ["emailInvalid"], age: ["tooYoung"] },
    });
    expect(handler).not.toHaveBeenCalled();
  });

  it("runs the handler with parsed, typed data and returns its result", async () => {
    const handler = vi.fn(
      async (data: z.output<typeof schema>): Promise<State> => ({
        status: `ok:${data.email}:${data.age + 1}`,
      }),
    );
    const action = validatedAction(schema, handler);

    const state = await action(
      { status: "idle" },
      formData({ email: " dev@example.com ", age: "30" }),
    );

    expect(handler).toHaveBeenCalledWith({ email: "dev@example.com", age: 30 });
    expect(state).toEqual({ status: "ok:dev@example.com:31" });
  });

  it("drops fields the schema doesn't know, such as React's hidden ones", async () => {
    const handler = vi.fn(async (): Promise<State> => ({ status: "ok" }));
    const action = validatedAction(schema, handler);

    await action(
      { status: "idle" },
      formData({
        email: "dev@example.com",
        age: "30",
        $ACTION_ID_abc: "",
        isAdmin: "true",
      }),
    );

    expect(handler).toHaveBeenCalledWith({ email: "dev@example.com", age: 30 });
  });
});
