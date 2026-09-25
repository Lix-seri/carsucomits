import { jsonRoute } from "@/lib/http";
import { requireSession } from "@/lib/session";
import { submitDeliverable } from "@/features/deliverables/server";

// POST /api/commissions/[id]/deliverables — multipart "file" + optional "message"
export const POST = jsonRoute(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const session = await requireSession();
  return submitDeliverable(session, (await ctx.params).id, await req.formData());
});
