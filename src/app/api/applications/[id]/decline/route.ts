import { jsonRoute } from "@/lib/http";
import { requireSession } from "@/lib/session";
import { declineApplication } from "@/features/applications/server";

// POST /api/applications/[id]/decline
export const POST = jsonRoute(async (_req, ctx: { params: Promise<{ id: string }> }) =>
  declineApplication(await requireSession(), (await ctx.params).id),
);
