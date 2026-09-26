import { jsonRoute, readJson } from "@/lib/http";
import { requireSession } from "@/lib/session";
import { decideVerification } from "@/features/verification/server";
import { decideVerificationSchema } from "@/features/verification/schemas";

// POST /api/verification/[id]/decision — { decision: "APPROVE" | "REJECT", note? } (admin or USED)
export const POST = jsonRoute(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const session = await requireSession();
  return decideVerification(session, (await ctx.params).id, decideVerificationSchema.parse(await readJson(req)));
});
