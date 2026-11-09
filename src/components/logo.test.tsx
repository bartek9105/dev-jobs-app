import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { Logo } from "./logo";

it("links home and is named without the decorative prompt", () => {
  render(<Logo />);

  expect(screen.getByRole("link", { name: "byteyourjob" })).toHaveAttribute(
    "href",
    "/",
  );
});
