import { jsonRoute } from "@/lib/http";
import { requireSession } from "@/lib/session";
import { getProof } from "@/features/verification/server";

// GET /api/verification/[id]/proof — staff only; never cached, never public.
export const GET = jsonRoute(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const proof = await getProof(await requireSession(), (await ctx.params).id);
  return new Response(new Uint8Array(proof.proof), {
    headers: {
      "Content-Type": proof.proofType,
      "Content-Disposition": `inline; filename="${proof.proofName}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
});
