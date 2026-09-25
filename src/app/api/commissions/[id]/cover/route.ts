import { jsonRoute } from "@/lib/http";
import { requireSession } from "@/lib/session";
import { removeCover, setCover } from "@/features/commissions/server";
import { coverImageSchema } from "@/features/commissions/schemas";

type Ctx = { params: Promise<{ id: string }> };

// POST /api/commissions/[id]/cover — multipart "file"
export const POST = jsonRoute(async (req, ctx: Ctx) => {
  const session = await requireSession();
  const file = coverImageSchema.parse((await req.formData()).get("file"));
  return setCover(session, (await ctx.params).id, file);
});

// DELETE /api/commissions/[id]/cover
export const DELETE = jsonRoute(async (_req, ctx: Ctx) => removeCover(await requireSession(), (await ctx.params).id));
