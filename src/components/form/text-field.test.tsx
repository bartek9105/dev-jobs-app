import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { TextField } from "./text-field";

describe("TextField", () => {
  it("tabs to the input before its label action", async () => {
    const user = userEvent.setup();
    render(
      <TextField
        label="Email"
        name="email"
        labelAction={<a href="/help">Help</a>}
      />,
    );

    await user.tab();
    expect(screen.getByLabelText("Email")).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("link", { name: "Help" })).toHaveFocus();
  });

  it("associates the label with the input", () => {
    render(<TextField label="E-mail" name="email" type="email" />);

    const input = screen.getByLabelText("E-mail");
    expect(input).toHaveAttribute("name", "email");
    expect(input).toHaveAttribute("type", "email");
  });

  it("is valid and has no alert when there are no errors", () => {
    render(<TextField label="E-mail" name="email" />);

    expect(screen.getByLabelText("E-mail")).toBeValid();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("marks the input invalid and announces the error", () => {
    render(
      <TextField
        label="E-mail"
        name="email"
        errors={["Enter a valid e-mail address"]}
      />,
    );

    const input = screen.getByLabelText("E-mail");
    expect(input).toBeInvalid();
    expect(input).toHaveAccessibleDescription("Enter a valid e-mail address");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Enter a valid e-mail address",
    );
  });

  it("keeps the input's name to its label when there is a label action", () => {
    render(
      <TextField
        label="Password"
        name="password"
        labelAction={<a href="/reset">Forgot password?</a>}
      />,
    );

    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "name",
      "password",
    );
    expect(
      screen.getByRole("link", { name: "Forgot password?" }),
    ).toBeInTheDocument();
  });

  it("links the description to the input", () => {
    render(
      <TextField
        label="Password"
        name="password"
        description="At least 8 characters"
      />,
    );

    expect(screen.getByLabelText("Password")).toHaveAccessibleDescription(
      "At least 8 characters",
    );
  });
});
