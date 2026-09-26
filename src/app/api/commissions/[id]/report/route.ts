import { jsonRoute, readJson } from "@/lib/http";
import { requireSession } from "@/lib/session";
import { reportCommission } from "@/features/reports/server";
import { reportCommissionSchema } from "@/features/reports/schemas";

// POST /api/commissions/[id]/report — { reason, details }
export const POST = jsonRoute(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const session = await requireSession();
  return reportCommission(session, (await ctx.params).id, reportCommissionSchema.parse(await readJson(req)));
});
