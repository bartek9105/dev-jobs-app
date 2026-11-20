import { screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import type { OfferCard } from "@/features/offers/queries";
import { renderWithIntl } from "@/test/render-with-intl";
import { OfferList } from "./offer-list";

function offer(overrides: Partial<OfferCard> = {}): OfferCard {
  return {
    id: "offer-1",
    slug: "acme-frontend-developer",
    title: "Frontend Developer",
    seniority: "mid",
    workplace: "remote",
    published_at: "2026-11-18T12:00:00Z",
    company: { name: "Acme", slug: "acme", logo_path: null },
    salaries: [],
    skills: [],
    locations: [],
    ...overrides,
  };
}

it("lists each offer with its title and company", () => {
  renderWithIntl(
    <OfferList
      offers={[
        offer(),
        offer({
          id: "offer-2",
          title: "Backend Developer",
          company: { name: "Globex", slug: "globex", logo_path: null },
        }),
      ]}
    />,
  );

  const items = screen.getAllByRole("listitem");
  expect(items).toHaveLength(2);
  const [first, second] = items as [HTMLElement, HTMLElement];
  expect(
    within(first).getByRole("heading", { name: "Frontend Developer" }),
  ).toBeInTheDocument();
  expect(within(first).getByText("Acme")).toBeInTheDocument();
  expect(
    within(second).getByRole("heading", { name: "Backend Developer" }),
  ).toBeInTheDocument();
  expect(within(second).getByText("Globex")).toBeInTheDocument();
});

it("links each card to its offer page, named by the title alone", () => {
  renderWithIntl(<OfferList offers={[offer()]} />);

  expect(
    screen.getByRole("link", { name: "Frontend Developer" }),
  ).toHaveAttribute("href", "/offers/acme-frontend-developer");
});

it("labels each salary with its contract type and period", () => {
  renderWithIntl(
    <OfferList
      offers={[
        offer({
          salaries: [
            {
              employment_type: "b2b",
              min_amount: 15500,
              max_amount: 21500,
              currency: "PLN",
              period: "month",
            },
            {
              employment_type: "permanent",
              min_amount: 95,
              max_amount: 130,
              currency: "PLN",
              period: "hour",
            },
          ],
        }),
      ]}
    />,
  );

  // Each line spans several elements (the amount and period stay together in a span), so
  // compare the text a reader sees per line rather than one text node.
  const lines = screen
    .getAllByRole("listitem")
    .map((item) => item.textContent?.replace(/\s/g, " "));
  expect(lines).toContain("B2B: PLN 15,500–21,500 / month");
  expect(lines).toContain("Permanent: PLN 95–130 / hour");
});

it("treats the logo as decorative, since the company name is right next to it", () => {
  const { container } = renderWithIntl(
    <OfferList
      offers={[
        offer({
          company: {
            name: "Acme",
            slug: "acme",
            logo_path: "/icons/google.svg",
          },
        }),
      ]}
    />,
  );

  expect(container.querySelector("img")).toHaveAttribute("alt", "");
});

it("shows city, seniority and workplace separated by dots", () => {
  renderWithIntl(
    <OfferList
      offers={[
        offer({
          workplace: "hybrid",
          locations: [{ city: { name: "Kraków", slug: "krakow" } }],
        }),
      ]}
    />,
  );

  expect(screen.getByText("Kraków · Mid · Hybrid")).toBeInTheDocument();
});

it("leaves out the city for remote offers, without a stray dot", () => {
  renderWithIntl(<OfferList offers={[offer({ workplace: "remote" })]} />);

  expect(screen.getByText("Mid · Remote")).toBeInTheDocument();
});

it("says so when there are no offers", () => {
  renderWithIntl(<OfferList offers={[]} />);

  expect(screen.queryByRole("list")).not.toBeInTheDocument();
  expect(screen.getByText("No offers yet. Check back soon.")).toBeVisible();
});
