import { describe, expect, it } from "vitest";
import { formatTimeAgo } from "./format-time-ago";

const now = Date.UTC(2026, 10, 19, 12, 0, 0);

function ago(seconds: number, locale = "en") {
  return formatTimeAgo(new Date(now - seconds * 1000), now, locale);
}

describe("formatTimeAgo", () => {
  it("says now for anything under a minute", () => {
    expect(ago(0)).toBe("now");
    expect(ago(59)).toBe("now");
  });

  it("uses the largest whole unit", () => {
    expect(ago(60)).toBe("1m ago");
    expect(ago(5 * 60)).toBe("5m ago");
    expect(ago(3 * 3600)).toBe("3h ago");
    expect(ago(2 * 86400)).toBe("2d ago");
    expect(ago(45 * 86400)).toBe("1mo ago");
    expect(ago(400 * 86400)).toBe("1y ago");
  });

  it("rounds down, so it never claims more time than has passed", () => {
    expect(ago(47 * 3600)).toBe("1d ago");
    expect(ago(59 * 60)).toBe("59m ago");
  });

  it("says 1d ago rather than yesterday, to keep the short form", () => {
    expect(ago(86400)).toBe("1d ago");
  });

  it("treats a date slightly in the future as now", () => {
    expect(ago(-30)).toBe("now");
  });

  it("accepts the ISO strings the database returns", () => {
    expect(formatTimeAgo("2026-11-17T12:00:00+00:00", now, "en")).toBe(
      "2d ago",
    );
  });

  it("uses the locale's wording", () => {
    expect(ago(2 * 86400, "pl")).toBe("2 dni temu");
  });
});
