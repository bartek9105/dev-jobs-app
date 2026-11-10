import { describe, expect, it } from "vitest";
import { z } from "zod";
import { signUpSchema } from "./sign-up-schema";

const errorsFor = (input: unknown) => {
  const result = signUpSchema.safeParse(input);
  return result.success ? {} : z.flattenError(result.error).fieldErrors;
};

describe("signUpSchema", () => {
  it("accepts a valid email and password, trimming the email", () => {
    expect(
      signUpSchema.parse({ email: "  dev@example.com ", password: "12345678" }),
    ).toEqual({ email: "dev@example.com", password: "12345678" });
  });

  it("reports only 'required' for empty fields", () => {
    expect(errorsFor({ email: "   ", password: "" })).toEqual({
      email: ["emailRequired"],
      password: ["passwordRequired"],
    });
  });

  it("returns translation keys as messages", () => {
    expect(errorsFor({ email: "nope", password: "short" })).toEqual({
      email: ["emailInvalid"],
      password: ["passwordTooShort"],
    });
  });

  it("rejects passwords longer than bcrypt can use", () => {
    expect(
      errorsFor({ email: "dev@example.com", password: "a".repeat(73) }),
    ).toEqual({ password: ["passwordTooLong"] });
  });
});
