import type { ReactNode } from "react";
import { Heading } from "@/components/ui/heading";

type AuthPageShellProps = {
  title: string;
  description?: string;
  /** The page's main content, usually a form. */
  children?: ReactNode;
  /** A short line under the content, e.g. "Don't have an account? Sign up". */
  hint?: ReactNode;
  /** Another way in, shown last, e.g. "or" + Google sign-in. */
  alternative?: ReactNode;
};

/**
 * The shared structure of every auth page. A component rather than (auth)/layout.tsx:
 * a layout can't receive per-page props like the title, and it stays mounted across
 * navigations, which suits the side panel but not page content.
 *
 * Each section adds the space above itself, so spacing follows whichever sections a page
 * uses, and the components inside don't need outer margins of their own.
 */
export function AuthPageShell({
  title,
  description,
  children,
  hint,
  alternative,
}: AuthPageShellProps) {
  return (
    <>
      <Heading level={1} variant="h1">
        {title}
      </Heading>
      {description && (
        <p className="mt-4 text-sm text-muted-foreground">{description}</p>
      )}
      {children && <div className="mt-10">{children}</div>}
      {hint && (
        <p className="mt-6 text-sm font-medium text-muted-foreground">{hint}</p>
      )}
      {alternative && <div className="mt-6">{alternative}</div>}
    </>
  );
}
