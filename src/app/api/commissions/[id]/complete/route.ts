import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { notify } from "@/lib/notifications";

// POST /api/commissions/[id]/complete — REQ-4.4
// Called by the Commissioner when work is finished. The system then prompts the
// commissioner to leave a rating in the response (the UI opens the rating modal).
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { id } = await ctx.params;
  const commission = await prisma.commission.findUnique({ where: { id } });
  if (!commission) return NextResponse.json({ error: "Commission not found." }, { status: 404 });
  if (commission.commissionerId !== session.userId) {
    return NextResponse.json({ error: "Only the commissioner can mark this completed." }, { status: 403 });
  }
  if (commission.status !== "IN_PROGRESS") {
    return NextResponse.json({ error: "Only in-progress commissions can be marked completed." }, { status: 400 });
  }
  if (!commission.awardedToId) {
    return NextResponse.json({ error: "No applicant has been awarded yet." }, { status: 400 });
  }

  await prisma.commission.update({ where: { id }, data: { status: "COMPLETED" } });

  await notify({
    userId: commission.awardedToId,
    type: "COMMISSION_COMPLETED",
    title: "Commission marked completed",
    body: `"${commission.title}" was marked completed. Great work!`,
    link: `/hub`,
  });

  // Tell the UI to open the rating modal next.
  return NextResponse.json({
    ok: true,
    promptRating: true,
    rateeId: commission.awardedToId,
    commissionId: commission.id,
    commissionTitle: commission.title,
  });
}
