import { describe, expect, it } from "vitest";
import { parseClientEnv } from "./client";

const valid = {
  NEXT_PUBLIC_SITE_URL: "https://byteyourjob.example",
  NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_abc123",
};

describe("parseClientEnv", () => {
  it("returns the parsed values when every variable is valid", () => {
    expect(parseClientEnv(valid)).toEqual(valid);
  });

  it("names the missing variable in the error", () => {
    expect(() =>
      parseClientEnv({ ...valid, NEXT_PUBLIC_SITE_URL: undefined }),
    ).toThrow(/NEXT_PUBLIC_SITE_URL/);
  });

  it("rejects a value that is not a URL", () => {
    expect(() =>
      parseClientEnv({ ...valid, NEXT_PUBLIC_SITE_URL: "localhost:3000" }),
    ).toThrow(/NEXT_PUBLIC_SITE_URL/);
  });

  it("refuses a secret key in the public key variable", () => {
    expect(() =>
      parseClientEnv({
        ...valid,
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_secret_abc123",
      }),
    ).toThrow(/NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
  });
});
