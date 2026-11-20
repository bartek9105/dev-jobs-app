import { describe, expect, it } from "vitest";
import { formatSalaryRange } from "./format-salary";

// Intl uses special spaces (no-break, narrow no-break) between amounts and symbols; turn
// them into plain spaces so the expectations stay readable.
function format(...args: Parameters<typeof formatSalaryRange>) {
  return formatSalaryRange(...args).replace(/\s/g, " ");
}

describe("formatSalaryRange", () => {
  it("formats a range in the offer's currency", () => {
    expect(
      format({ min_amount: 15000, max_amount: 21000, currency: "PLN" }, "en"),
    ).toBe("PLN 15,000–21,000");
    expect(
      format({ min_amount: 4000, max_amount: 5000, currency: "EUR" }, "en"),
    ).toBe("€4,000 – €5,000");
    expect(
      format({ min_amount: 95, max_amount: 130, currency: "USD" }, "en"),
    ).toBe("$95 – $130");
  });

  it("follows the locale's conventions", () => {
    expect(
      format({ min_amount: 15000, max_amount: 21000, currency: "PLN" }, "pl"),
    ).toBe("15 000–21 000 zł");
  });

  it("shows a single amount when min and max are the same", () => {
    expect(
      format({ min_amount: 20000, max_amount: 20000, currency: "PLN" }, "en"),
    ).toBe("PLN 20,000");
  });

  it("never shows decimals", () => {
    expect(
      format({ min_amount: 120, max_amount: 160, currency: "EUR" }, "en"),
    ).toBe("€120 – €160");
  });
});
