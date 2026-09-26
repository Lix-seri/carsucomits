import { jsonRoute, readJson } from "@/lib/http";
import { requireSession } from "@/lib/session";
import { decideFlag } from "@/features/moderation/server";
import { decideFlagSchema } from "@/features/moderation/schemas";

// POST /api/admin/flags/[id]/decision — { decision: "APPROVE" | "REMOVE", note? }
export const POST = jsonRoute(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const session = await requireSession();
  return decideFlag(session, (await ctx.params).id, decideFlagSchema.parse(await readJson(req)));
});
