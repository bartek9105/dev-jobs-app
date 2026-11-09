import { createCn } from "cn/config";

/**
 * Joins class names and resolves Tailwind conflicts (last one wins).
 *
 * Custom `--text-*` size tokens from globals.css must be registered here. Otherwise
 * `text-heading-2` looks like a text *colour*, and `cn("text-heading text-heading-2")`
 * would drop the colour class as a "conflict".
 */
export const cn = createCn({
  extend: {
    theme: {
      text: ["heading-1", "heading-2"],
    },
  },
});
