import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { HintLink } from "./hint-link";

it("renders a link to a known route", () => {
  render(<HintLink href="/sign-up">Sign up</HintLink>);

  expect(screen.getByRole("link", { name: "Sign up" })).toHaveAttribute(
    "href",
    "/sign-up",
  );
});

it("still rejects unknown routes at compile time", () => {
  // @ts-expect-error `/signup` isn't a route; typecheck fails if this stops erroring.
  render(<HintLink href="/signup">Sign up</HintLink>);

  expect(screen.getByRole("link")).toBeInTheDocument();
});
