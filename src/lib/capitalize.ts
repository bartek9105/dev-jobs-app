/**
 * The text with its first letter in upper case: "remote" → "Remote".
 *
 * Splits by character, not by UTF-16 unit (which `text[0]` and charAt use), so text
 * starting with an emoji or another multi-unit character isn't cut in half. The locale
 * applies language rules, such as Turkish "i" → "İ".
 */
export function capitalize(text: string, locale?: string): string {
  const [first = "", ...rest] = text;
  return first.toLocaleUpperCase(locale) + rest.join("");
}
