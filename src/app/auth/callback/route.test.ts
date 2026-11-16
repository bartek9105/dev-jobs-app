import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const exchangeCodeForSession = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { exchangeCodeForSession } }),
}));

// Next's redirect() throws to stop rendering; capture where it was sent instead.
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT ${url}`);
  },
}));

const callback = (query: string) =>
  GET(new NextRequest(`http://localhost:3000/auth/callback?${query}`));

describe("GET /auth/callback", () => {
  beforeEach(() => {
    exchangeCodeForSession.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("exchanges the code for a session and sends the user home", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: null });

    await expect(callback("code=abc")).rejects.toThrow(/^REDIRECT \/$/);
    expect(exchangeCodeForSession).toHaveBeenCalledWith("abc");
  });

  it("shows the error page when the exchange fails", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: new Error("bad code") });

    await expect(callback("code=abc")).rejects.toThrow(
      /^REDIRECT \/auth-error$/,
    );
    expect(console.error).toHaveBeenCalled();
  });

  it("shows the error page, without logging, when the user cancels on Google", async () => {
    await expect(
      callback("error=access_denied&error_description=cancelled"),
    ).rejects.toThrow(/^REDIRECT \/auth-error$/);
    expect(exchangeCodeForSession).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  });

  it("ignores a `next` parameter, so the link can't redirect off-site", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: null });

    await expect(callback("code=abc&next=//evil.example")).rejects.toThrow(
      /^REDIRECT \/$/,
    );
  });
});
