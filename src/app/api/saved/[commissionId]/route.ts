import { jsonRoute } from "@/lib/http";
import { requireSession } from "@/lib/session";
import { toggleSaved } from "@/features/commissions/server";

// POST /api/saved/[commissionId] — toggles the bookmark
export const POST = jsonRoute(async (_req, ctx: { params: Promise<{ commissionId: string }> }) =>
  toggleSaved(await requireSession(), (await ctx.params).commissionId),
);
