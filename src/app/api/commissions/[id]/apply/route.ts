import { jsonRoute, readJson } from "@/lib/http";
import { requireSession } from "@/lib/session";
import { applyToCommission } from "@/features/applications/server";
import { applySchema } from "@/features/applications/schemas";

// POST /api/commissions/[id]/apply — { coverLetter?, proposedRate? }
export const POST = jsonRoute(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const session = await requireSession();
  return applyToCommission(session, (await ctx.params).id, applySchema.parse(await readJson(req)));
});
