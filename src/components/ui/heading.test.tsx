import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Heading } from "./heading";

describe("Heading", () => {
  it("renders the tag for its level", () => {
    render(<Heading level={2}>Recent offers</Heading>);

    expect(
      screen.getByRole("heading", { level: 2, name: "Recent offers" }),
    ).toBeInTheDocument();
  });

  it("keeps the level when styled like another heading", () => {
    render(
      <Heading level={3} variant="h2">
        Company details
      </Heading>,
    );

    const heading = screen.getByRole("heading", { name: "Company details" });
    expect(heading.tagName).toBe("H3");
    expect(heading).toHaveClass("text-heading-2");
  });

  it("keeps its colour class with the h1 size", () => {
    render(
      <Heading level={1} variant="h1">
        Sign in
      </Heading>,
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveClass(
      "text-heading",
      "text-heading-1",
    );
  });

  it("keeps both its colour and size classes, plus extra ones", () => {
    render(
      <Heading level={2} className="mb-4">
        Recent offers
      </Heading>,
    );

    // Guards against cn treating the custom size token as a colour and dropping one.
    expect(screen.getByRole("heading")).toHaveClass(
      "text-heading",
      "text-heading-2",
      "mb-4",
    );
  });
});
