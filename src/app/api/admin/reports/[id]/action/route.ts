import { jsonRoute, readJson } from "@/lib/http";
import { requireSession } from "@/lib/session";
import { actOnReport } from "@/features/reports/server";
import { reportActionSchema } from "@/features/reports/schemas";

// POST /api/admin/reports/[id]/action — { action: "RESOLVE" | "ESCALATE" | "REOPEN" }
export const POST = jsonRoute(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const session = await requireSession();
  return actOnReport(session, (await ctx.params).id, reportActionSchema.parse(await readJson(req)).action);
});
