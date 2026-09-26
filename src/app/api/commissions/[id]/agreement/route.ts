import { jsonRoute, readJson } from "@/lib/http";
import { requireSession } from "@/lib/session";
import { acceptAgreement, declineAgreement } from "@/features/agreements/server";
import { declineAgreementSchema } from "@/features/agreements/schemas";

type Ctx = { params: Promise<{ id: string }> };

// POST /api/commissions/[id]/agreement — accept the current agreement version.
export const POST = jsonRoute(async (_req: Request, ctx: Ctx) => acceptAgreement(await requireSession(), (await ctx.params).id));

// DELETE /api/commissions/[id]/agreement — { reason? } decline before work starts.
export const DELETE = jsonRoute(async (req: Request, ctx: Ctx) => {
  const session = await requireSession();
  const { reason } = declineAgreementSchema.parse(await readJson(req));
  return declineAgreement(session, (await ctx.params).id, reason);
});
