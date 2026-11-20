import { screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { renderWithIntl } from "@/test/render-with-intl";
import HomePage from "./page";

// LiveOffers is an async Server Component, which React can't render in a test (jsdom is a
// client environment). Swap it for a stub: the page's own markup is what's under test here;
// OfferList and getLiveOffers have tests of their own.
vi.mock("@/features/offers/components/live-offers/live-offers", () => ({
  LiveOffers: () => <p>live offers</p>,
}));

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

it("shows the live offers in a labelled section", () => {
  renderWithIntl(<HomePage />);

  const section = screen.getByRole("region", { name: "Latest offers" });
  expect(section).toHaveTextContent("live offers");
});
