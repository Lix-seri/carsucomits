import { jsonRoute, readJson } from "@/lib/http";
import { requireSession } from "@/lib/session";
import { decideDeliverable } from "@/features/deliverables/server";
import { decisionSchema } from "@/features/deliverables/schemas";

// POST /api/deliverables/[id]/decision — { action: "APPROVE" | "REQUEST_REVISION", notes? }
export const POST = jsonRoute(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const session = await requireSession();
  return decideDeliverable(session, (await ctx.params).id, decisionSchema.parse(await readJson(req)));
});
