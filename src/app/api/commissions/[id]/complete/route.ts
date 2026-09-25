import { jsonRoute, readJson } from "@/lib/http";
import { requireSession } from "@/lib/session";
import { completeWithRating } from "@/features/ratings/server";

// POST /api/commissions/[id]/complete — { stars, comment } marks COMPLETED and rates atomically
export const POST = jsonRoute(async (req, ctx: { params: Promise<{ id: string }> }) =>
  completeWithRating(await requireSession(), (await ctx.params).id, await readJson(req)),
);
