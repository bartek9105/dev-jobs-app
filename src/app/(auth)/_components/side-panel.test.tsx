import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { renderWithIntl } from "@/test/render-with-intl";
import { SidePanel } from "./side-panel";

it("lets keyboard and screen reader users pause the animation", async () => {
  const user = userEvent.setup();
  renderWithIntl(<SidePanel />);

  const toggle = screen.getByRole("checkbox", { name: "Pause animation" });
  expect(toggle).not.toBeChecked();

  await user.tab();
  expect(toggle).toHaveFocus();
  await user.keyboard(" ");
  expect(toggle).toBeChecked();
});
