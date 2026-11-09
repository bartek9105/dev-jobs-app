import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "@/test/render-with-intl";
import { TextField } from "./text-field";

describe("password TextField", () => {
  it("hides the password until the user toggles it, then hides it again", async () => {
    const user = userEvent.setup();
    renderWithIntl(
      <TextField label="Password" name="password" type="password" />,
    );

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

  it("passes the input element to the caller's ref", () => {
    const ref = createRef<HTMLInputElement>();
    renderWithIntl(
      <TextField label="Password" name="password" type="password" ref={ref} />,
    );

    expect(ref.current).toBe(screen.getByLabelText("Password"));
  });

  it("does not submit the form when the toggle is clicked", async () => {
    const user = userEvent.setup();
    let submitted = false;
    renderWithIntl(
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
    renderWithIntl(
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
