import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { renderWithIntl } from "@/test/render-with-intl";
import ErrorPage from "./error";

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

it("explains what happened and logs the error", () => {
  const error = new Error("boom");

  renderWithIntl(<ErrorPage error={error} retry={() => {}} />);

  expect(
    screen.getByRole("heading", { level: 1, name: "Something went wrong" }),
  ).toBeInTheDocument();
  expect(console.error).toHaveBeenCalledWith(error);
});

it("retries when asked", async () => {
  const retry = vi.fn();
  renderWithIntl(<ErrorPage error={new Error("boom")} retry={retry} />);

  await userEvent.click(screen.getByRole("button", { name: "Try again" }));

  expect(retry).toHaveBeenCalledOnce();
});
