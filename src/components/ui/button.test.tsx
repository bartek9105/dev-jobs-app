import { render, screen } from "@testing-library/react";
import { ArrowRightIcon, MailIcon } from "lucide-react";
import { describe, expect, it } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("is not a submit button unless asked to be", () => {
    render(<Button>Save</Button>);

    // Base UI defaults to type="button", unlike a native <button>.
    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute(
      "type",
      "button",
    );
  });

  it("names the button by its text, not its icons", () => {
    render(
      <Button variant="outline">
        <MailIcon data-icon="inline-start" />
        Continue with e-mail
        <ArrowRightIcon data-icon="inline-end" />
      </Button>,
    );

    expect(
      screen.getByRole("button", { name: "Continue with e-mail" }),
    ).toBeInTheDocument();
  });
});
