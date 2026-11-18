import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const verifyOtp = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { verifyOtp } }),
}));

// Next's redirect() throws to stop rendering; capture where it was sent instead.
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT ${url}`);
  },
}));

const confirm = (query: string) =>
  GET(new NextRequest(`http://localhost:3000/auth/confirm?${query}`));

describe("GET /auth/confirm", () => {
  beforeEach(() => verifyOtp.mockReset());

  it("verifies the token and sends the user home", async () => {
    verifyOtp.mockResolvedValue({ error: null });

    await expect(confirm("token_hash=abc&type=email")).rejects.toThrow(
      /^REDIRECT \/$/,
    );
    expect(verifyOtp).toHaveBeenCalledWith({
      type: "email",
      token_hash: "abc",
    });
  });

  it("sends an invalid or expired token to the error page", async () => {
    verifyOtp.mockResolvedValue({ error: new Error("expired") });

    await expect(confirm("token_hash=abc&type=email")).rejects.toThrow(
      "REDIRECT /auth-error",
    );
  });

  it("sends password reset links to the set-new-password page", async () => {
    verifyOtp.mockResolvedValue({ error: null });

    await expect(confirm("token_hash=abc&type=recovery")).rejects.toThrow(
      /^REDIRECT \/update-password$/,
    );
    expect(verifyOtp).toHaveBeenCalledWith({
      type: "recovery",
      token_hash: "abc",
    });
  });

  it("rejects token types without a destination, without verifying them", async () => {
    await expect(confirm("token_hash=abc&type=invite")).rejects.toThrow(
      /^REDIRECT \/auth-error$/,
    );
    expect(verifyOtp).not.toHaveBeenCalled();
  });

  it("ignores a `next` parameter, so the link can't redirect off-site", async () => {
    verifyOtp.mockResolvedValue({ error: null });

    await expect(
      confirm("token_hash=abc&type=email&next=https://evil.example"),
    ).rejects.toThrow(/^REDIRECT \/$/);
    await expect(
      confirm("token_hash=abc&type=recovery&next=https://evil.example"),
    ).rejects.toThrow(/^REDIRECT \/update-password$/);
  });
});
