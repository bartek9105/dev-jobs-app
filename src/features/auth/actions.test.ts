import { AuthApiError } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { signIn, signUp } from "./actions";

const supabaseSignUp = vi.fn();
const supabaseSignIn = vi.fn();

// The real server client reads Next's request cookies; here we only need its auth API.
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { signUp: supabaseSignUp, signInWithPassword: supabaseSignIn },
  }),
}));

// Next's redirect() throws to end the action; capture where it was sent instead.
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT ${url}`);
  },
}));

const formData = (fields: Record<string, string>) => {
  const data = new FormData();
  for (const [name, value] of Object.entries(fields)) data.set(name, value);
  return data;
};

const idle = { status: "idle" } as const;

describe("signUp action", () => {
  beforeEach(() => {
    supabaseSignUp.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("returns field errors without calling Supabase when input is invalid", async () => {
    const state = await signUp(
      idle,
      formData({ email: "nope", password: "short" }),
    );

    expect(state).toEqual({
      status: "error",
      fieldErrors: { email: ["emailInvalid"], password: ["passwordTooShort"] },
    });
    expect(supabaseSignUp).not.toHaveBeenCalled();
  });

  it("signs up with the validated data and never echoes the password", async () => {
    supabaseSignUp.mockResolvedValue({ data: {}, error: null });

    const state = await signUp(
      idle,
      formData({ email: " dev@example.com ", password: "correct-horse" }),
    );

    expect(supabaseSignUp).toHaveBeenCalledWith({
      email: "dev@example.com",
      password: "correct-horse",
    });
    expect(state).toEqual({ status: "success", email: "dev@example.com" });
    expect(JSON.stringify(state)).not.toContain("correct-horse");
  });

  it("looks like success when the email is taken, so accounts can't be discovered", async () => {
    supabaseSignUp.mockResolvedValue({
      data: {},
      error: new AuthApiError(
        "User already registered",
        422,
        "user_already_exists",
      ),
    });

    const state = await signUp(
      idle,
      formData({ email: "taken@example.com", password: "correct-horse" }),
    );

    expect(state).toEqual({ status: "success", email: "taken@example.com" });
  });

  it("shows a weak password as an error on the password field", async () => {
    supabaseSignUp.mockResolvedValue({
      data: {},
      error: new AuthApiError("Weak password", 422, "weak_password"),
    });

    const state = await signUp(
      idle,
      formData({ email: "dev@example.com", password: "password" }),
    );

    expect(state).toMatchObject({
      status: "error",
      fieldErrors: { password: ["weakPassword"] },
    });
  });

  it("maps unknown failures to a generic message and logs them", async () => {
    supabaseSignUp.mockResolvedValue({
      data: {},
      error: new AuthApiError("Boom", 500, "unexpected_failure"),
    });

    const state = await signUp(
      idle,
      formData({ email: "dev@example.com", password: "correct-horse" }),
    );

    expect(state).toMatchObject({ status: "error", formError: "generic" });
    expect(console.error).toHaveBeenCalled();
  });
});

describe("signIn action", () => {
  beforeEach(() => {
    supabaseSignIn.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("returns field errors without calling Supabase when fields are empty", async () => {
    const state = await signIn(idle, formData({ email: "", password: "" }));

    expect(state).toEqual({
      status: "error",
      fieldErrors: {
        email: ["emailRequired"],
        password: ["passwordRequired"],
      },
    });
    expect(supabaseSignIn).not.toHaveBeenCalled();
  });

  it("doesn't apply sign-up password rules, so older passwords still work", async () => {
    supabaseSignIn.mockResolvedValue({ data: {}, error: null });

    await expect(
      signIn(idle, formData({ email: "dev@example.com", password: "short" })),
    ).rejects.toThrow(/^REDIRECT \/$/);
    expect(supabaseSignIn).toHaveBeenCalledWith({
      email: "dev@example.com",
      password: "short",
    });
  });

  it("redirects home after a successful sign-in", async () => {
    supabaseSignIn.mockResolvedValue({ data: {}, error: null });

    await expect(
      signIn(
        idle,
        formData({ email: " dev@example.com ", password: "correct-horse" }),
      ),
    ).rejects.toThrow(/^REDIRECT \/$/);
  });

  it("reports wrong credentials as one form error, not on a field", async () => {
    supabaseSignIn.mockResolvedValue({
      data: {},
      error: new AuthApiError(
        "Invalid login credentials",
        400,
        "invalid_credentials",
      ),
    });

    const state = await signIn(
      idle,
      formData({ email: "dev@example.com", password: "wrong-password" }),
    );

    expect(state).toEqual({
      status: "error",
      formError: "invalidCredentials",
    });
    expect(console.error).not.toHaveBeenCalled();
  });

  it("tells unconfirmed users to confirm their email", async () => {
    supabaseSignIn.mockResolvedValue({
      data: {},
      error: new AuthApiError(
        "Email not confirmed",
        400,
        "email_not_confirmed",
      ),
    });

    const state = await signIn(
      idle,
      formData({ email: "dev@example.com", password: "correct-horse" }),
    );

    expect(state).toMatchObject({ formError: "emailNotConfirmed" });
  });

  it("maps unknown failures to a generic message and logs them", async () => {
    supabaseSignIn.mockResolvedValue({
      data: {},
      error: new AuthApiError("Boom", 500, "unexpected_failure"),
    });

    const state = await signIn(
      idle,
      formData({ email: "dev@example.com", password: "correct-horse" }),
    );

    expect(state).toMatchObject({ formError: "generic" });
    expect(console.error).toHaveBeenCalled();
  });
});
