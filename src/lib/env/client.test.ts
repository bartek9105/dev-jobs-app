import { describe, expect, it } from "vitest";
import { parseClientEnv } from "./client";

describe("parseClientEnv", () => {
  it("returns the parsed values when every variable is valid", () => {
    expect(
      parseClientEnv({ NEXT_PUBLIC_SITE_URL: "https://devjobs.example" }),
    ).toEqual({
      NEXT_PUBLIC_SITE_URL: "https://devjobs.example",
    });
  });

  it("names the missing variable in the error", () => {
    expect(() => parseClientEnv({ NEXT_PUBLIC_SITE_URL: undefined })).toThrow(
      /NEXT_PUBLIC_SITE_URL/,
    );
  });

  it("rejects a value that is not a URL", () => {
    expect(() =>
      parseClientEnv({ NEXT_PUBLIC_SITE_URL: "localhost:3000" }),
    ).toThrow(/NEXT_PUBLIC_SITE_URL/);
  });
});
