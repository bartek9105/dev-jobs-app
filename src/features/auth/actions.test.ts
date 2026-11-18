import { AuthApiError } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  requestPasswordReset,
  signIn,
  signInWithGoogle,
  signUp,
  updatePassword,
} from "./actions";

const supabaseSignUp = vi.fn();
const supabaseSignIn = vi.fn();
const supabaseSignInWithOAuth = vi.fn();
const supabaseResetPasswordForEmail = vi.fn();
const supabaseUpdateUser = vi.fn();
const currentUser = vi.fn();

// The real server client reads Next's request cookies; here we only need its auth API.
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      signUp: supabaseSignUp,
      signInWithPassword: supabaseSignIn,
      signInWithOAuth: supabaseSignInWithOAuth,
      resetPasswordForEmail: supabaseResetPasswordForEmail,
      updateUser: supabaseUpdateUser,
    },
  }),
}));

vi.mock("@/lib/auth/current-user", () => ({
  getCurrentUser: () => currentUser(),
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

describe("signInWithGoogle action", () => {
  beforeEach(() => {
    supabaseSignInWithOAuth.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("sends the user to Google, asking to come back to our callback", async () => {
    supabaseSignInWithOAuth.mockResolvedValue({
      data: { provider: "google", url: "https://accounts.google.com/o/oauth2" },
      error: null,
    });

    await expect(signInWithGoogle()).rejects.toThrow(
      /^REDIRECT https:\/\/accounts\.google\.com\/o\/oauth2$/,
    );
    expect(supabaseSignInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: { redirectTo: "http://localhost:3000/auth/callback" },
    });
  });

  it("shows the error page and logs when the flow can't start", async () => {
    supabaseSignInWithOAuth.mockResolvedValue({
      data: { provider: "google", url: null },
      error: new AuthApiError(
        "Provider is not enabled",
        400,
        "validation_failed",
      ),
    });

    await expect(signInWithGoogle()).rejects.toThrow(/^REDIRECT \/auth-error$/);
    expect(console.error).toHaveBeenCalled();
  });
});

describe("requestPasswordReset action", () => {
  beforeEach(() => {
    supabaseResetPasswordForEmail.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("emails a reset link and reports success", async () => {
    supabaseResetPasswordForEmail.mockResolvedValue({ data: {}, error: null });

    const state = await requestPasswordReset(
      idle,
      formData({ email: " dev@example.com " }),
    );

    expect(supabaseResetPasswordForEmail).toHaveBeenCalledWith(
      "dev@example.com",
    );
    expect(state).toEqual({ status: "success", email: "dev@example.com" });
  });

  it("asks the user to wait when resets are rate limited", async () => {
    supabaseResetPasswordForEmail.mockResolvedValue({
      data: {},
      error: new AuthApiError(
        "For security purposes, you can only request this after 60 seconds.",
        429,
        "over_email_send_rate_limit",
      ),
    });

    const state = await requestPasswordReset(
      idle,
      formData({ email: "dev@example.com" }),
    );

    expect(state).toEqual({ status: "error", formError: "rateLimited" });
    expect(console.error).not.toHaveBeenCalled();
  });
});

describe("updatePassword action", () => {
  // Built per test run so it stays inside the reset window.
  const resetSession = {
    id: "user-1",
    lastSignIn: { method: "otp", timestamp: Date.now() / 1000 },
  };

  beforeEach(() => {
    supabaseUpdateUser.mockReset();
    currentUser.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("refuses without a session, even with a valid password", async () => {
    currentUser.mockResolvedValue(null);

    const state = await updatePassword(
      idle,
      formData({ password: "brand-new-password" }),
    );

    expect(state).toEqual({ status: "error", formError: "sessionExpired" });
    expect(supabaseUpdateUser).not.toHaveBeenCalled();
  });

  it("refuses an ordinary signed-in session, which didn't come from a reset link", async () => {
    currentUser.mockResolvedValue({
      id: "user-1",
      lastSignIn: { method: "password", timestamp: Date.now() / 1000 },
    });

    const state = await updatePassword(
      idle,
      formData({ password: "brand-new-password" }),
    );

    expect(state).toEqual({ status: "error", formError: "sessionExpired" });
    expect(supabaseUpdateUser).not.toHaveBeenCalled();
  });

  it("applies the sign-up password rules", async () => {
    currentUser.mockResolvedValue(resetSession);

    const state = await updatePassword(idle, formData({ password: "short" }));

    expect(state).toEqual({
      status: "error",
      fieldErrors: { password: ["passwordTooShort"] },
    });
    expect(supabaseUpdateUser).not.toHaveBeenCalled();
  });

  it("updates the password and sends the user home", async () => {
    currentUser.mockResolvedValue(resetSession);
    supabaseUpdateUser.mockResolvedValue({ data: {}, error: null });

    await expect(
      updatePassword(idle, formData({ password: "brand-new-password" })),
    ).rejects.toThrow(/^REDIRECT \/$/);
    expect(supabaseUpdateUser).toHaveBeenCalledWith({
      password: "brand-new-password",
    });
  });

  it("shows reusing the current password as a field error", async () => {
    currentUser.mockResolvedValue(resetSession);
    supabaseUpdateUser.mockResolvedValue({
      data: {},
      error: new AuthApiError("Same password", 422, "same_password"),
    });

    const state = await updatePassword(
      idle,
      formData({ password: "brand-new-password" }),
    );

    expect(state).toEqual({
      status: "error",
      fieldErrors: { password: ["samePassword"] },
    });
  });
});
