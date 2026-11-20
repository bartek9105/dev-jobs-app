import { beforeEach, describe, expect, it, vi } from "vitest";
import { getLiveOffers, OFFERS_CACHE_TAG } from "./queries";

vi.mock("server-only", () => ({}));

const cacheTag = vi.fn();
vi.mock("next/cache", () => ({
  cacheLife: vi.fn(),
  cacheTag: (...tags: string[]) => cacheTag(...tags),
}));

// A stand-in for Supabase's query builder: every method returns the builder, and the
// last one (limit) resolves to the response.
const response = vi.fn();
const builder = {
  from: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
  order: vi.fn(),
  limit: vi.fn(),
};
for (const method of ["from", "select", "eq", "order"] as const) {
  builder[method].mockReturnValue(builder);
}
builder.limit.mockImplementation(() => response());

vi.mock("@/lib/supabase/public", () => ({
  createPublicClient: () => builder,
}));

describe("getLiveOffers", () => {
  beforeEach(() => {
    response.mockReset();
    cacheTag.mockClear();
  });

  it("returns published offers, newest first, tagged for revalidation", async () => {
    const offers = [{ id: "offer-1", title: "Frontend Developer" }];
    response.mockResolvedValue({ data: offers, error: null });

    await expect(getLiveOffers()).resolves.toBe(offers);
    expect(builder.from).toHaveBeenCalledWith("offers");
    expect(builder.eq).toHaveBeenCalledWith("status", "published");
    expect(builder.order).toHaveBeenCalledWith("published_at", {
      ascending: false,
    });
    expect(cacheTag).toHaveBeenCalledWith(OFFERS_CACHE_TAG);
  });

  it("throws when the query fails, so error.tsx shows it and nothing is cached", async () => {
    const error = { message: "connection refused" };
    response.mockResolvedValue({ data: null, error });

    await expect(getLiveOffers()).rejects.toMatchObject({
      message: "Failed to load live offers",
      cause: error,
    });
  });
});
