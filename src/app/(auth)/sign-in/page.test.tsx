import { screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { renderWithIntl } from "@/test/render-with-intl";
import SignInPage from "./page";

it("renders its copy from the translations", () => {
  renderWithIntl(<SignInPage />);

  expect(
    screen.getByRole("heading", { level: 1, name: "Sign in" }),
  ).toBeInTheDocument();
  expect(screen.getByLabelText("Email")).toHaveAttribute(
    "placeholder",
    "Enter your email address",
  );
  expect(
    screen.getByRole("button", { name: "Sign in with Google" }),
  ).toBeInTheDocument();
});

it("gives password managers and phones the right field hints", () => {
  renderWithIntl(<SignInPage />);

  const email = screen.getByLabelText("Email");
  expect(email).toHaveAttribute("type", "email");
  expect(email).toHaveAttribute("autocomplete", "email");
  expect(screen.getByLabelText("Password")).toHaveAttribute(
    "autocomplete",
    "current-password",
  );
});

it("sends forgotten passwords to the recovery page", () => {
  renderWithIntl(<SignInPage />);

  expect(
    screen.getByRole("link", { name: "Forgot password?" }),
  ).toHaveAttribute("href", "/forgot-password");
});

it("puts the sign-up link inside the translated sentence", () => {
  renderWithIntl(<SignInPage />);

  const link = screen.getByRole("link", { name: "Sign up" });
  expect(link).toHaveAttribute("href", "/sign-up");
  expect(link.parentElement).toHaveTextContent(
    "Don't have an account? Sign up",
  );
});
