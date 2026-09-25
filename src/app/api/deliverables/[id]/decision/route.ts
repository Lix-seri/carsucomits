import { jsonRoute, readJson } from "@/lib/http";
import { requireSession } from "@/lib/session";
import { decideDeliverable } from "@/features/deliverables/server";

// POST /api/deliverables/[id]/decision — { action: "APPROVE" | "REQUEST_REVISION", notes? }
export const POST = jsonRoute(async (req, ctx: { params: Promise<{ id: string }> }) =>
  decideDeliverable(await requireSession(), (await ctx.params).id, await readJson(req)),
);
