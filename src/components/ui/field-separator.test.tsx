import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FieldSeparator } from "./field";

describe("FieldSeparator", () => {
  it("shows its text and hides the decorative lines from screen readers", () => {
    const { container } = render(<FieldSeparator>or</FieldSeparator>);

    expect(screen.getByText("or")).toBeVisible();
    expect(screen.queryByRole("separator")).not.toBeInTheDocument();
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2);
  });

  it("is a plain separator without text", () => {
    render(<FieldSeparator />);

    expect(screen.getByRole("separator")).toBeInTheDocument();
  });
});
