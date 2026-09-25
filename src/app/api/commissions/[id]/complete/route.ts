import { jsonRoute, readJson } from "@/lib/http";
import { requireSession } from "@/lib/session";
import { completeWithRating } from "@/features/ratings/server";
import { ratingSchema } from "@/features/ratings/schemas";

// POST /api/commissions/[id]/complete — { stars, comment? }
export const POST = jsonRoute(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const session = await requireSession();
  return completeWithRating(session, (await ctx.params).id, ratingSchema.parse(await readJson(req)));
});
