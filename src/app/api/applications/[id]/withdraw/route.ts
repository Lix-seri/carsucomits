import { jsonRoute } from "@/lib/http";
import { requireSession } from "@/lib/session";
import { withdrawApplication } from "@/features/applications/server";

// POST /api/applications/[id]/withdraw
export const POST = jsonRoute(async (_req, ctx: { params: Promise<{ id: string }> }) =>
  withdrawApplication(await requireSession(), (await ctx.params).id),
);
