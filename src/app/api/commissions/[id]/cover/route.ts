import { jsonRoute } from "@/lib/http";
import { requireSession } from "@/lib/session";
import { removeCover, setCover } from "@/features/commissions/server";

type Ctx = { params: Promise<{ id: string }> };

// POST /api/commissions/[id]/cover — multipart "file"
export const POST = jsonRoute(async (req, ctx: Ctx) =>
  setCover(await requireSession(), (await ctx.params).id, (await req.formData()).get("file")),
);

// DELETE /api/commissions/[id]/cover
export const DELETE = jsonRoute(async (_req, ctx: Ctx) => removeCover(await requireSession(), (await ctx.params).id));
