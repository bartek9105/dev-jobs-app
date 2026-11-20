import { useLocale, useTranslations } from "next-intl";
import { formatSalaryRange } from "@/features/offers/format-salary";
import type { OfferCard } from "@/features/offers/queries";
import { cn } from "@/lib/utils";

type OfferSalariesProps = {
  salaries: OfferCard["salaries"];
  className?: string;
};

export function OfferSalaries({ salaries, className }: OfferSalariesProps) {
  const t = useTranslations("Offer");
  const locale = useLocale();

  return (
    <ul className={cn("flex flex-col", className)}>
      {salaries.map((salary) => (
        <li
          key={salary.employment_type}
          className="text-sm font-medium text-success-strong"
        >
          {t(`employmentType.${salary.employment_type}`)}:{" "}
          <span className="whitespace-nowrap">
            {formatSalaryRange(salary, locale)} {t(`period.${salary.period}`)}
          </span>
        </li>
      ))}
    </ul>
  );
}
