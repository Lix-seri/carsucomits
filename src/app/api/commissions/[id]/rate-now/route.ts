import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { notify } from "@/features/notifications/server";

// POST /api/commissions/[id]/rate-now — retroactively add a rating to a
// commission that was already marked COMPLETED (legacy data fix).
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { id } = await ctx.params;
  const { stars, comment } = await req.json();
  const starsNum = Number(stars);
  if (!Number.isInteger(starsNum) || starsNum < 1 || starsNum > 5) {
    return NextResponse.json({ error: "Stars must be 1–5." }, { status: 400 });
  }
  if (starsNum <= 3 && (!comment || String(comment).trim().length < 10)) {
    return NextResponse.json({ error: "Please leave at least 10 characters of feedback for ratings of 3 or below." }, { status: 400 });
  }

  const commission = await prisma.commission.findUnique({ where: { id } });
  if (!commission) return NextResponse.json({ error: "Commission not found." }, { status: 404 });
  if (commission.commissionerId !== session.userId) {
    return NextResponse.json({ error: "Only the commissioner can rate this." }, { status: 403 });
  }
  if (commission.status !== "COMPLETED") {
    return NextResponse.json({ error: "Only completed commissions can be rated retroactively." }, { status: 400 });
  }
  if (!commission.awardedToId) {
    return NextResponse.json({ error: "No applicant was awarded." }, { status: 400 });
  }

  const rateeId = commission.awardedToId;
  const trimmedComment = comment ? String(comment).trim() : null;

  await prisma.rating.upsert({
    where: { commissionId_raterId_rateeId: { commissionId: id, raterId: session.userId, rateeId } },
    update: { stars: starsNum, comment: trimmedComment },
    create: { commissionId: id, raterId: session.userId, rateeId, stars: starsNum, comment: trimmedComment },
  });

  await notify({
    userId: rateeId,
    type: "RATING_RECEIVED",
    title: `You received a ${starsNum}-star rating`,
    body: trimmedComment ? `"${trimmedComment.slice(0, 80)}"` : `For "${commission.title}"`,
    link: `/profile`,
  });

  // Auto-flag <3.0
  const agg = await prisma.rating.aggregate({ where: { rateeId }, _avg: { stars: true }, _count: true });
  const avg = agg._avg.stars ?? null;
  if (avg != null && agg._count >= 2 && avg < 3.0) {
    const target = await prisma.user.findUnique({ where: { id: rateeId }, select: { status: true } });
    if (target && target.status === "ACTIVE") {
      await prisma.user.update({ where: { id: rateeId }, data: { status: "WARNED" } });
      await prisma.auditLog.create({
        data: {
          actorId: session.userId,
          action: "AUTO_FLAG_LOW_RATING",
          target: rateeId,
          meta: JSON.stringify({ avg, ratingCount: agg._count }),
        },
      });
    }
  }

  return NextResponse.json({ ok: true, average: avg });
}
