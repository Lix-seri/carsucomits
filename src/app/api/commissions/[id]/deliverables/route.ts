import { jsonRoute } from "@/lib/http";
import { requireSession } from "@/lib/session";
import { submitDeliverable } from "@/features/deliverables/server";
import { deliverableSchema } from "@/features/deliverables/schemas";

// POST /api/commissions/[id]/deliverables — multipart "file" + optional "message"
export const POST = jsonRoute(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const session = await requireSession();
  const form = await req.formData();
  const input = deliverableSchema.parse({ file: form.get("file"), message: form.get("message") });
  return submitDeliverable(session, (await ctx.params).id, input);
});
