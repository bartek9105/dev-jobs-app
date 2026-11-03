import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import HomePage from "./page";

// HomePage is a synchronous Server Component, so it renders like any React component.
// Async Server Components can't be rendered here yet; those get covered by Playwright.
it("renders the site name as the main heading", () => {
  render(<HomePage />);

  expect(
    screen.getByRole("heading", { level: 1, name: "DevJobs" }),
  ).toBeInTheDocument();
});
