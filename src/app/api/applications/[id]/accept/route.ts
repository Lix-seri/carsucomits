import { jsonRoute } from "@/lib/http";
import { requireSession } from "@/lib/session";
import { acceptApplication } from "@/features/applications/server";

// POST /api/applications/[id]/accept
export const POST = jsonRoute(async (_req, ctx: { params: Promise<{ id: string }> }) =>
  acceptApplication(await requireSession(), (await ctx.params).id),
);
