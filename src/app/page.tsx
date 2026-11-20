import { useTranslations } from "next-intl";
import { Heading } from "@/components/ui/heading";
import { siteConfig } from "@/config/site";
import { LiveOffers } from "@/features/offers/components/live-offers/live-offers";

export default function HomePage() {
  const tSite = useTranslations("Site");
  const t = useTranslations("HomePage");

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-4 py-16">
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl font-semibold tracking-tight">
          {siteConfig.name}
        </h1>
        <p className="text-lg text-foreground/70">{tSite("description")}</p>
      </div>

      <section aria-labelledby="latest-offers" className="flex flex-col gap-4">
        <Heading level={2} id="latest-offers">
          {t("latestOffers")}
        </Heading>
        <LiveOffers />
      </section>
    </main>
  );
}
