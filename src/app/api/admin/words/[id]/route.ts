import { jsonRoute } from "@/lib/http";
import { requireSession } from "@/lib/session";
import { removeWord } from "@/features/moderation/server";

// DELETE /api/admin/words/[id]
export const DELETE = jsonRoute(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => removeWord(await requireSession(), (await ctx.params).id));
