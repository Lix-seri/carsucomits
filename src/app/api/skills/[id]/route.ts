import { jsonRoute } from "@/lib/http";
import { requireSession } from "@/lib/session";
import { removeSkill } from "@/features/profile/server";

// DELETE /api/skills/[id]
export const DELETE = jsonRoute(async (_req, ctx: { params: Promise<{ id: string }> }) =>
  removeSkill(await requireSession(), (await ctx.params).id),
);
