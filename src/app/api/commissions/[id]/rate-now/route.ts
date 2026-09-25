import { jsonRoute, readJson } from "@/lib/http";
import { requireSession } from "@/lib/session";
import { rateRetroactively } from "@/features/ratings/server";

// POST /api/commissions/[id]/rate-now — rate an already-completed commission
export const POST = jsonRoute(async (req, ctx: { params: Promise<{ id: string }> }) =>
  rateRetroactively(await requireSession(), (await ctx.params).id, await readJson(req)),
);
