import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithIntl } from "@/test/render-with-intl";
import { updatePassword } from "../../actions";
import { UpdatePasswordForm } from "./update-password-form";

vi.mock("../../actions", () => ({ updatePassword: vi.fn() }));

const action = vi.mocked(updatePassword);

describe("UpdatePasswordForm", () => {
  beforeEach(() => action.mockReset());

  it("applies the password rules before sending anything", async () => {
    const user = userEvent.setup();
    renderWithIntl(<UpdatePasswordForm email="dev@example.com" />);

    await user.type(screen.getByLabelText("New password"), "short");
    await user.click(screen.getByRole("button", { name: "Update password" }));

    expect(action).not.toHaveBeenCalled();
    expect(screen.getByLabelText("New password")).toHaveAccessibleDescription(
      /Password must be at least 8 characters/,
    );
  });

  it("lets password managers save the password for the right account", () => {
    const { container } = renderWithIntl(
      <UpdatePasswordForm email="dev@example.com" />,
    );

    expect(container.querySelector('[autocomplete="username"]')).toHaveValue(
      "dev@example.com",
    );
    expect(screen.getByLabelText("New password")).toHaveAttribute(
      "autocomplete",
      "new-password",
    );
  });

  it("shows an expired session as a form error", async () => {
    action.mockResolvedValue({ status: "error", formError: "sessionExpired" });
    const user = userEvent.setup();
    renderWithIntl(<UpdatePasswordForm email="dev@example.com" />);

    await user.type(
      screen.getByLabelText("New password"),
      "brand-new-password",
    );
    await user.click(screen.getByRole("button", { name: "Update password" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Your reset link has expired. Request a new one.",
    );
  });
});
