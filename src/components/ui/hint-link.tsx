import type { Route } from "next";
import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type HintLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  // Spelled out because wrapping Link loses its typedRoutes check on `href`.
  href: Route;
};

function HintLink({ className, ...props }: HintLinkProps) {
  return (
    <Link
      data-slot="hint-link"
      className={cn(
        // Always underlined: inside a sentence the pink alone isn't enough to show it's a link
        // (WCAG 1.4.1), as its luminance is almost the same as the grey text around it.
        "rounded-sm text-sm font-normal text-primary underline underline-offset-2 hover:decoration-2 focus-visible:outline-2 focus-visible:outline-offset-2",
        className,
      )}
      {...props}
    />
  );
}

export { HintLink };
