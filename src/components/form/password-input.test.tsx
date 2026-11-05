import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { TextField } from "./text-field";

describe("password TextField", () => {
  it("hides the password until the user toggles it, then hides it again", async () => {
    const user = userEvent.setup();
    render(<TextField label="Password" name="password" type="password" />);

    const input = screen.getByLabelText("Password");
    const toggle = screen.getByRole("button", { name: "Show password" });
    expect(input).toHaveAttribute("type", "password");
    expect(toggle).toHaveAttribute("aria-pressed", "false");

    await user.click(toggle);
    expect(input).toHaveAttribute("type", "text");
    expect(toggle).toHaveAttribute("aria-pressed", "true");

    await user.click(toggle);
    expect(input).toHaveAttribute("type", "password");
    expect(toggle).toHaveAttribute("aria-pressed", "false");
  });

  it("does not submit the form when the toggle is clicked", async () => {
    const user = userEvent.setup();
    let submitted = false;
    render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submitted = true;
        }}
      >
        <TextField label="Password" name="password" type="password" />
      </form>,
    );

    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(submitted).toBe(false);
  });

  it("hides the password again when the form is submitted", async () => {
    const user = userEvent.setup();
    render(
      <form onSubmit={(event) => event.preventDefault()}>
        <TextField label="Password" name="password" type="password" />
      </form>,
    );

    await user.click(screen.getByRole("button", { name: "Show password" }));
    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("type", "text");

    fireEvent.submit(input.closest("form")!);
    expect(input).toHaveAttribute("type", "password");
  });
});
