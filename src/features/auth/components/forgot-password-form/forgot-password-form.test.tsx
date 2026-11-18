import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithIntl } from "@/test/render-with-intl";
import { requestPasswordReset } from "../../actions";
import { ForgotPasswordForm } from "./forgot-password-form";

vi.mock("../../actions", () => ({ requestPasswordReset: vi.fn() }));

const action = vi.mocked(requestPasswordReset);

describe("ForgotPasswordForm", () => {
  beforeEach(() => action.mockReset());

  it("never calls the action with an empty email", async () => {
    const user = userEvent.setup();
    renderWithIntl(<ForgotPasswordForm />);

    await user.click(screen.getByRole("button", { name: "Send reset link" }));

    expect(action).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Email")).toHaveAccessibleDescription(
      "Enter your email address",
    );
  });

  it("confirms without revealing whether the account exists", async () => {
    action.mockResolvedValue({ status: "success", email: "dev@example.com" });
    const user = userEvent.setup();
    renderWithIntl(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText("Email"), "dev@example.com");
    await user.click(screen.getByRole("button", { name: "Send reset link" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "If an account exists for dev@example.com, we’ve sent a link to reset your password.",
    );
  });
});
