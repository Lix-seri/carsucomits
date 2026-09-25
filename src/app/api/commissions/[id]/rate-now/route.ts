import { jsonRoute, readJson } from "@/lib/http";
import { requireSession } from "@/lib/session";
import { rateRetroactively } from "@/features/ratings/server";
import { ratingSchema } from "@/features/ratings/schemas";

// POST /api/commissions/[id]/rate-now — { stars, comment? }
export const POST = jsonRoute(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const session = await requireSession();
  return rateRetroactively(session, (await ctx.params).id, ratingSchema.parse(await readJson(req)));
});
