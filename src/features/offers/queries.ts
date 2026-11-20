import "server-only";
import type { QueryData } from "@supabase/supabase-js";
import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";

export const OFFERS_CACHE_TAG = "offers";
const LIVE_OFFERS_LIMIT = 50;

function selectOfferCards(supabase: ReturnType<typeof createPublicClient>) {
  return supabase.from("offers").select(
    `id, slug, title, seniority, workplace, published_at,
     company:companies(name, slug, logo_path),
     salaries:offer_salaries(employment_type, min_amount, max_amount, currency, period),
     skills:offer_skills(level, required, skill:skills(name, slug)),
     locations:offer_locations(city:cities(name, slug))`,
  );
}

export type OfferCard = QueryData<ReturnType<typeof selectOfferCards>>[number];

export async function getLiveOffers(): Promise<OfferCard[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(OFFERS_CACHE_TAG);

  const { data, error } = await selectOfferCards(createPublicClient())
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .order("id")
    .limit(LIVE_OFFERS_LIMIT);

  if (error) throw new Error("Failed to load live offers", { cause: error });
  return data;
}

function selectOfferDetails(supabase: ReturnType<typeof createPublicClient>) {
  return supabase.from("offers").select(
    `id, slug, title, description, seniority, workplace, published_at, apply_url,
     company:companies(name, slug, logo_path, website),
     salaries:offer_salaries(employment_type, min_amount, max_amount, currency, period),
     skills:offer_skills(level, required, skill:skills(name, slug)),
     locations:offer_locations(city:cities(name, slug))`,
  );
}

export type OfferDetails = QueryData<
  ReturnType<typeof selectOfferDetails>
>[number];

/**
 * One live offer by slug, or null if there's none (never published, a draft, expired:
 * RLS hides all of those from the anonymous client). Cached and tagged like the list.
 */
export async function getLiveOffer(slug: string): Promise<OfferDetails | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(OFFERS_CACHE_TAG);

  const { data, error } = await selectOfferDetails(createPublicClient())
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error("Failed to load offer", { cause: error });
  return data;
}
