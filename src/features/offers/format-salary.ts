import type { OfferCard } from "./queries";

type SalaryRange = Pick<
  OfferCard["salaries"][number],
  "min_amount" | "max_amount" | "currency"
>;

export function formatSalaryRange(
  { min_amount, max_amount, currency }: SalaryRange,
  locale: string,
): string {
  const format = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });

  return min_amount === max_amount
    ? format.format(min_amount)
    : format.formatRange(min_amount, max_amount);
}
