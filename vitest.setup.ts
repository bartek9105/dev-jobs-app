// Adds DOM matchers like toBeInTheDocument() and their TypeScript types.
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Testing Library only auto-unmounts when test globals are enabled; we import
// explicitly instead, so unmount rendered trees between tests ourselves.
afterEach(() => {
  cleanup();
});
