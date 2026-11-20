import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { TimeAgo } from "@/components/time-ago";
import { offerRoute } from "@/config/routes";
import type { OfferCard } from "@/features/offers/queries";
import { OfferMeta } from "../offer-meta/offer-meta";
import { OfferSalaries } from "../offer-salaries/offer-salaries";
import { SkillTags } from "../skill-tags/skill-tags";

type OfferListProps = {
  offers: OfferCard[];
};

export function OfferList({ offers }: OfferListProps) {
  const t = useTranslations("OfferList");

  if (offers.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("empty")}</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {offers.map((offer) => (
        <li
          key={offer.id}
          className="relative flex gap-4 rounded-md border border-transparent border-l-primary p-4 shadow-card inset-shadow-[2px_0_0_var(--color-primary)] transition-[border-color,box-shadow] duration-350 ease-in-out hover:border-primary hover:inset-shadow-[0_0_0_var(--color-primary)] has-focus-visible:border-primary has-focus-visible:outline-2 has-focus-visible:outline-offset-2"
        >
          {offer.company.logo_path && (
            <Image
              src={offer.company.logo_path}
              alt=""
              width={36}
              height={36}
              className="size-9 shrink-0 self-start object-contain"
            />
          )}
          <div className="flex w-full flex-col gap-3">
            <div className="gap-1">
              <div className="flex w-full justify-between gap-2">
                <h3 className="font-semibold text-heading">
                  <Link
                    href={offerRoute(offer.slug)}
                    className="outline-none after:absolute after:inset-0 after:rounded-md"
                  >
                    {offer.title}
                  </Link>
                </h3>
                {offer.published_at && (
                  <TimeAgo
                    date={offer.published_at}
                    className="shrink-0 text-sm whitespace-nowrap text-muted-foreground"
                  />
                )}
              </div>
              <p className="mb-2 text-sm text-muted-foreground">
                {offer.company.name}
              </p>
              <OfferMeta offer={offer} />
            </div>
            <OfferSalaries salaries={offer.salaries} />
            <SkillTags skills={offer.skills} limit={3} />
          </div>
        </li>
      ))}
    </ul>
  );
}
