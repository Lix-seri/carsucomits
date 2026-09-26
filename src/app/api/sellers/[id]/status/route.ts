import { jsonRoute, readJson } from "@/lib/http";
import { requireSession } from "@/lib/session";
import { setSellerStatus } from "@/features/verification/server";
import { sellerActionSchema } from "@/features/verification/schemas";

// POST /api/sellers/[id]/status — { action: "SUSPEND" | "REINSTATE", reason } (admin or USED)
export const POST = jsonRoute(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const session = await requireSession();
  return setSellerStatus(session, (await ctx.params).id, sellerActionSchema.parse(await readJson(req)));
});
