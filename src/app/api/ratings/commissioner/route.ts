import { jsonRoute, readJson } from "@/lib/http";
import { requireSession } from "@/lib/session";
import { rateCommissioner } from "@/features/ratings/server";
import { commissionerRatingSchema } from "@/features/ratings/schemas";

// POST /api/ratings/commissioner — { commissionId, stars, comment? }
export const POST = jsonRoute(async (req) => {
  const session = await requireSession();
  return rateCommissioner(session, commissionerRatingSchema.parse(await readJson(req)));
});
