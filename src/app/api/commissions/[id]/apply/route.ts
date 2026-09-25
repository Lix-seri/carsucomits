import { jsonRoute, readJson } from "@/lib/http";
import { requireSession } from "@/lib/session";
import { applyToCommission } from "@/features/applications/server";

// POST /api/commissions/[id]/apply — { coverLetter?, proposedRate? }
export const POST = jsonRoute(async (req, ctx: { params: Promise<{ id: string }> }) =>
  applyToCommission(await requireSession(), (await ctx.params).id, await readJson(req)),
);
