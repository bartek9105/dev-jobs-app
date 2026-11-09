import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const headingVariants = cva("font-heading text-heading", {
  variants: {
    // Each variant needs a --text-heading-* token in globals.css, registered in lib/utils.ts.
    variant: {
      h1: "text-heading-1",
      h2: "text-heading-2",
    },
  },
  defaultVariants: {
    variant: "h2",
  },
});

type HeadingProps = ComponentProps<"h2"> &
  VariantProps<typeof headingVariants> & {
    /** The HTML tag (document outline): keep levels in order, h2 → h3, never h2 → h4. */
    level: 1 | 2 | 3 | 4 | 5 | 6;
  };

/**
 * `level` decides the tag, `variant` decides the look, so an <h3> can be styled
 * like an h2 without breaking the outline screen readers and search engines use.
 */
function Heading({ level, variant, className, ...props }: HeadingProps) {
  const Tag = `h${level}` as const;

  return (
    <Tag
      data-slot="heading"
      className={cn(headingVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Heading, headingVariants };
