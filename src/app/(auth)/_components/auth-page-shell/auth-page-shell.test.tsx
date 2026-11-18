import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AuthPageShell } from "./auth-page-shell";

describe("AuthPageShell", () => {
  it("renders the title as the page's only h1, with every section in order", () => {
    const { container } = render(
      <AuthPageShell
        title="Sign in"
        description="Welcome back"
        hint={<span>Hint</span>}
        alternative={<span>Alternative</span>}
      >
        <span>Form</span>
      </AuthPageShell>,
    );

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(container).toHaveTextContent(
      "Sign inWelcome backFormHintAlternative",
    );
  });

  it("renders no empty wrappers for sections a page doesn't use", () => {
    const { container } = render(
      <AuthPageShell title="Something went wrong" hint="Back to sign in" />,
    );

    // Only the heading and the hint: an empty content wrapper would add stray spacing.
    expect(container.childElementCount).toBe(2);
  });
});
