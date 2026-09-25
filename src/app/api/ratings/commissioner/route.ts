import { jsonRoute, readJson } from "@/lib/http";
import { requireSession } from "@/lib/session";
import { rateCommissioner } from "@/features/ratings/server";

// POST /api/ratings/commissioner — { commissionId, stars, comment }
export const POST = jsonRoute(async (req) => rateCommissioner(await requireSession(), await readJson(req)));
