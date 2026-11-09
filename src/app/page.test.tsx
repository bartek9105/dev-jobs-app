import { screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { renderWithIntl } from "@/test/render-with-intl";
import HomePage from "./page";

// HomePage is a synchronous Server Component, so it renders like any React component.
// Async Server Components can't be rendered here yet; those get covered by Playwright.
it("renders the site name as the main heading", () => {
  renderWithIntl(<HomePage />);

  expect(
    screen.getByRole("heading", { level: 1, name: "byteyourjob" }),
  ).toBeInTheDocument();
});

it("renders the translated description", () => {
  renderWithIntl(<HomePage />);

  expect(screen.getByText(/^Job offers for software developers/)).toBeVisible();
});
