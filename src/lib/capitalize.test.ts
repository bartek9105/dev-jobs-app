import { expect, it } from "vitest";
import { capitalize } from "./capitalize";

it("upper-cases only the first letter", () => {
  expect(capitalize("remote")).toBe("Remote");
  expect(capitalize("full time")).toBe("Full time");
  expect(capitalize("iOS")).toBe("IOS");
});

it("leaves empty text and already capitalised text alone", () => {
  expect(capitalize("")).toBe("");
  expect(capitalize("Senior")).toBe("Senior");
});

it("handles letters outside ASCII", () => {
  expect(capitalize("łódź")).toBe("Łódź");
});

it("keeps a leading emoji whole instead of splitting it", () => {
  expect(capitalize("🚀 launch")).toBe("🚀 launch");
});

it("follows the locale's rules", () => {
  expect(capitalize("istanbul", "tr")).toBe("İstanbul");
  expect(capitalize("istanbul", "en")).toBe("Istanbul");
});
