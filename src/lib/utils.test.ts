import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn with the custom theme tokens", () => {
  it("treats text-heading-* as a size, so it keeps the text colour next to it", () => {
    expect(cn("text-heading text-heading-2")).toBe(
      "text-heading text-heading-2",
    );
    expect(cn("text-sm text-heading-2")).toBe("text-heading-2");
  });

  it("treats shadow-card as a shadow, so it keeps a shadow colour next to it", () => {
    expect(cn("shadow-card shadow-black/10")).toBe(
      "shadow-card shadow-black/10",
    );
    expect(cn("shadow-md shadow-card")).toBe("shadow-card");
  });
});
