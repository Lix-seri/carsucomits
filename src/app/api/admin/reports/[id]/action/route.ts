import { jsonRoute, readJson } from "@/lib/http";
import { requireSession } from "@/lib/session";
import { actOnReport } from "@/features/reports/server";

// POST /api/admin/reports/[id]/action — body: { action: "RESOLVE" | "ESCALATE" | "REOPEN" }
export const POST = jsonRoute(async (req, ctx: { params: Promise<{ id: string }> }) =>
  actOnReport(await requireSession(), (await ctx.params).id, (await readJson(req)).action),
);
