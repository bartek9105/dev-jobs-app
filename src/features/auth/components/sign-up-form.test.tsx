import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithIntl } from "@/test/render-with-intl";
import { signUp } from "../actions";
import { SignUpForm } from "./sign-up-form";

// The form is tested against a fake action; the action itself has its own tests.
vi.mock("../actions", () => ({ signUp: vi.fn() }));

const action = vi.mocked(signUp);

function setup() {
  const user = userEvent.setup();
  renderWithIntl(<SignUpForm />);
  return {
    user,
    email: () => screen.getByLabelText("Email"),
    password: () => screen.getByLabelText("Password"),
    submit: () => user.click(screen.getByRole("button", { name: "Sign up" })),
  };
}

describe("SignUpForm", () => {
  beforeEach(() => action.mockReset());

  it("never calls the action with empty fields", async () => {
    const { submit, email, password } = setup();

    await submit();

    expect(action).not.toHaveBeenCalled();
    expect(email()).toHaveAccessibleDescription("Enter your email address");
    expect(password()).toHaveAccessibleDescription(/Enter a password/);
    expect(email()).toHaveFocus();
  });

  it("clears an error as soon as the field becomes valid", async () => {
    const { user, submit, email } = setup();

    await submit();
    await user.type(email(), "dev@");
    expect(email()).toHaveAccessibleDescription("Enter a valid email address");

    await user.type(email(), "example.com");
    expect(email()).not.toHaveAccessibleDescription();
    expect(email()).toBeValid();
  });

  it("shows a server-only error and clears it when the user edits the field", async () => {
    action.mockResolvedValue({
      status: "error",
      email: "dev@example.com",
      fieldErrors: { password: ["weakPassword"] },
    });
    const { user, submit, email, password } = setup();

    await user.type(email(), "dev@example.com");
    await user.type(password(), "password");
    await submit();

    expect(action).toHaveBeenCalledOnce();
    expect(await screen.findByText(/too easy to guess/)).toBeVisible();
    expect(email()).toHaveValue("dev@example.com");

    await user.type(password(), "-and-more");
    expect(screen.queryByText(/too easy to guess/)).not.toBeInTheDocument();
  });

  it("shows a form-level error as an alert", async () => {
    action.mockResolvedValue({
      status: "error",
      email: "dev@example.com",
      formError: "rateLimited",
    });
    const { user, submit, email, password } = setup();

    await user.type(email(), "dev@example.com");
    await user.type(password(), "correct-horse");
    await submit();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Too many attempts. Wait a moment and try again.",
    );
  });

  it("replaces the form with a check-your-email message on success", async () => {
    action.mockResolvedValue({ status: "success", email: "dev@example.com" });
    const { user, submit, email, password } = setup();

    await user.type(email(), "dev@example.com");
    await user.type(password(), "correct-horse");
    await submit();

    expect(await screen.findByRole("status")).toHaveTextContent(
      "We sent a confirmation link to dev@example.com.",
    );
    expect(screen.queryByLabelText("Password")).not.toBeInTheDocument();
  });
});
