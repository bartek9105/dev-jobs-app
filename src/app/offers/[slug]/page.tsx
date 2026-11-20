import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HintLink } from "@/components/ui/hint-link";
import { ROUTES } from "@/config/routes";
import { OfferMeta } from "@/features/offers/components/offer-meta/offer-meta";
import { OfferSalaries } from "@/features/offers/components/offer-salaries/offer-salaries";
import { SkillTags } from "@/features/offers/components/skill-tags/skill-tags";
import { getLiveOffer, getLiveOffers } from "@/features/offers/queries";

/**
 * Prerender the current live offers at build time: static HTML, good for search engines,
 * and a real 404 status for slugs that don't exist. Offers published later render on
 * their first visit and are then cached too.
 */
export async function generateStaticParams() {
  const offers = await getLiveOffers();

  // With Cache Components the list can't be empty (Next uses an entry to check the page
  // for runtime-only code at build time). With no live offers, a slug that matches
  // nothing still gives it a page to check: it renders the 404.
  if (offers.length === 0) return [{ slug: "no-offers-yet" }];
  return offers.map((offer) => ({ slug: offer.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/offers/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const offer = await getLiveOffer(slug);
  if (!offer) return {};

  return { title: `${offer.title} at ${offer.company.name}` };
}

/** A first version of the offer page; the description and design come next. */
export default async function OfferPage({
  params,
}: PageProps<"/offers/[slug]">) {
  const { slug } = await params;
  const offer = await getLiveOffer(slug);
  if (!offer) notFound();

  const t = await getTranslations("Offer");

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-16">
      <HintLink href={ROUTES.home} className="self-start">
        {t("allOffers")}
      </HintLink>

      <div className="flex gap-4">
        {offer.company.logo_path && (
          <Image
            src={offer.company.logo_path}
            alt=""
            width={48}
            height={48}
            className="size-12 shrink-0 self-start object-contain"
          />
        )}
        <div className="flex flex-col gap-1">
          <Heading level={1} variant="h1">
            {offer.title}
          </Heading>
          <p className="text-muted-foreground">{offer.company.name}</p>
          <OfferMeta offer={offer} />
        </div>
      </div>

      <OfferSalaries salaries={offer.salaries} />
      <SkillTags skills={offer.skills} />

      <a
        href={offer.apply_url}
        className={buttonVariants({ className: "self-start" })}
      >
        {t("apply")}
      </a>
    </main>
  );
}
