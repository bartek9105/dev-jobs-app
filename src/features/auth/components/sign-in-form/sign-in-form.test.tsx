import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithIntl } from "@/test/render-with-intl";
import { signIn } from "../../actions";
import { SignInForm } from "./sign-in-form";

vi.mock("../../actions", () => ({ signIn: vi.fn() }));

const action = vi.mocked(signIn);

function setup() {
  const user = userEvent.setup();
  renderWithIntl(<SignInForm />);
  return {
    user,
    email: () => screen.getByLabelText("Email"),
    password: () => screen.getByLabelText("Password"),
    submit: () => user.click(screen.getByRole("button", { name: "Sign in" })),
  };
}

describe("SignInForm", () => {
  beforeEach(() => action.mockReset());

  it("never calls the action with empty fields", async () => {
    const { submit, email, password } = setup();

    await submit();

    expect(action).not.toHaveBeenCalled();
    expect(email()).toHaveAccessibleDescription("Enter your email address");
    expect(password()).toHaveAccessibleDescription("Enter your password");
  });

  it("lets password managers fill the saved password", () => {
    const { password } = setup();

    expect(password()).toHaveAttribute("autocomplete", "current-password");
  });

  it("shows wrong credentials as a form error and keeps the email", async () => {
    action.mockResolvedValue({
      status: "error",
      formError: "invalidCredentials",
    });
    const { user, submit, email, password } = setup();

    await user.type(email(), "dev@example.com");
    await user.type(password(), "wrong-password");
    await submit();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Incorrect email or password",
    );
    expect(email()).toHaveValue("dev@example.com");
    expect(email()).toBeValid();
    expect(password()).toBeValid();
  });

  it("hides the form error once the user edits, and shows the next one again", async () => {
    action.mockResolvedValue({
      status: "error",
      formError: "invalidCredentials",
    });
    const { user, submit, email, password } = setup();

    await user.type(email(), "dev@example.com");
    await user.type(password(), "wrong-password");
    await submit();
    expect(await screen.findByRole("alert")).toBeVisible();

    await user.type(password(), "!");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    await submit();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Incorrect email or password",
    );
  });
});
