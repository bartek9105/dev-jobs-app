import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TextField } from "./text-field";

describe("TextField", () => {
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
