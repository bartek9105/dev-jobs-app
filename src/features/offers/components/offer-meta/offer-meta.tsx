import { useLocale } from "next-intl";
import type { OfferCard } from "@/features/offers/queries";
import { capitalize } from "@/lib/capitalize";
import { cn } from "@/lib/utils";

type OfferMetaProps = {
  offer: Pick<OfferCard, "locations" | "seniority" | "workplace">;
  className?: string;
};

export function OfferMeta({ offer, className }: OfferMetaProps) {
  const locale = useLocale();

  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      {[
        offer.locations[0]?.city.name,
        capitalize(offer.seniority, locale),
        capitalize(offer.workplace, locale),
      ]
        .filter(Boolean)
        .join(" · ")}
    </p>
  );
}
