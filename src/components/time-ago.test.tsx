import { act, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { renderWithIntl } from "@/test/render-with-intl";
import { TimeAgo } from "./time-ago";

const published = "2026-11-17T12:00:00.000Z";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-11-19T12:00:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

it("shows how long ago the date was, with the exact date for machines and on hover", () => {
  renderWithIntl(<TimeAgo date={published} />);

  const time = screen.getByText("2d ago");
  expect(time.tagName).toBe("TIME");
  expect(time).toHaveAttribute("datetime", published);
  expect(time).toHaveAttribute("title", "Nov 17, 2026");
});

it("updates as time passes", () => {
  vi.setSystemTime(new Date("2026-11-17T12:05:00Z"));
  renderWithIntl(<TimeAgo date={published} />);
  expect(screen.getByText("5m ago")).toBeInTheDocument();

  act(() => {
    vi.advanceTimersByTime(60_000);
  });

  expect(screen.getByText("6m ago")).toBeInTheDocument();
});

it("renders the plain date on the server, where there's no clock to use", () => {
  const html = renderToString(
    <NextIntlClientProvider locale="en" messages={{}}>
      <TimeAgo date={published} />
    </NextIntlClientProvider>,
  );

  expect(html).toContain("Nov 17, 2026");
  expect(html).not.toContain("ago");
});
