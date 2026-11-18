import { describe, expect, it } from "vitest";
import type { CurrentUser } from "./current-user";
import {
  canSetNewPassword,
  PASSWORD_RESET_WINDOW_SECONDS,
} from "./password-reset";

const now = Date.UTC(2026, 10, 18, 12, 0, 0);
const nowSeconds = now / 1000;

function user(lastSignIn: CurrentUser["lastSignIn"]): CurrentUser {
  return { id: "user-1", email: "dev@example.com", lastSignIn };
}

describe("canSetNewPassword", () => {
  it("allows a session that a reset link just created", () => {
    expect(
      canSetNewPassword(
        user({ method: "otp", timestamp: nowSeconds - 60 }),
        now,
      ),
    ).toBe(true);
  });

  it("allows it up to the end of the window", () => {
    expect(
      canSetNewPassword(
        user({
          method: "otp",
          timestamp: nowSeconds - PASSWORD_RESET_WINDOW_SECONDS,
        }),
        now,
      ),
    ).toBe(true);
  });

  it("refuses once the window has passed", () => {
    expect(
      canSetNewPassword(
        user({
          method: "otp",
          timestamp: nowSeconds - PASSWORD_RESET_WINDOW_SECONDS - 1,
        }),
        now,
      ),
    ).toBe(false);
  });

  it.each(["password", "oauth"])(
    "refuses a fresh %s sign-in, which didn't come from an email link",
    (method) => {
      expect(
        canSetNewPassword(user({ method, timestamp: nowSeconds }), now),
      ).toBe(false);
    },
  );

  it("refuses without a user or sign-in record", () => {
    expect(canSetNewPassword(null, now)).toBe(false);
    expect(canSetNewPassword(user(null), now)).toBe(false);
  });
});
