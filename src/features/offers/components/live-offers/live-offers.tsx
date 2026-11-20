import { getLiveOffers } from "@/features/offers/queries";
import { OfferList } from "../offer-list/offer-list";

/**
 * Fetches the live offers and renders them. The data is cached (see getLiveOffers), so the
 * result goes into the prerendered page and needs no <Suspense>: nothing waits per request.
 * Kept apart from OfferList so the list can be tested without a database.
 */
export async function LiveOffers() {
  const offers = await getLiveOffers();

  return <OfferList offers={offers} />;
}
