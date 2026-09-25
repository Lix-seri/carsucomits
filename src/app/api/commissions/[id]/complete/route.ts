import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { notify } from "@/features/notifications/server";

// POST /api/commissions/[id]/complete — REQ-4.4 + REQ-5.1 atomic
// Marks the commission COMPLETED *and* creates the rating in one transaction.
// Without a rating, the commission stays IN_PROGRESS — by design, so reviewers
// can never be skipped.
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const { stars, comment } = body ?? {};

  const starsNum = Number(stars);
  if (!Number.isInteger(starsNum) || starsNum < 1 || starsNum > 5) {
    return NextResponse.json({ error: "A 1–5 star rating is required to mark the commission complete." }, { status: 400 });
  }
  if (starsNum <= 3 && (!comment || String(comment).trim().length < 10)) {
    return NextResponse.json({ error: "Please leave at least 10 characters of feedback for ratings of 3 or below." }, { status: 400 });
  }

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

  const rateeId = commission.awardedToId;
  const trimmedComment = comment ? String(comment).trim() : null;

  // Atomically: create the rating, mark the commission completed.
  await prisma.$transaction([
    prisma.rating.upsert({
      where: { commissionId_raterId_rateeId: { commissionId: id, raterId: session.userId, rateeId } },
      update: { stars: starsNum, comment: trimmedComment },
      create: { commissionId: id, raterId: session.userId, rateeId, stars: starsNum, comment: trimmedComment },
    }),
    prisma.commission.update({ where: { id }, data: { status: "COMPLETED" } }),
  ]);

  await notify({
    userId: rateeId,
    type: "COMMISSION_COMPLETED",
    title: "Commission marked completed",
    body: `"${commission.title}" was marked completed. You received a ${starsNum}-star rating!`,
    link: `/profile`,
  });
  await notify({
    userId: rateeId,
    type: "RATING_RECEIVED",
    title: `You received a ${starsNum}-star rating`,
    body: trimmedComment ? `"${trimmedComment.slice(0, 80)}"` : `For "${commission.title}"`,
    link: `/profile`,
  });

  // REQ-5.3: auto-flag if average drops below 3.0 with at least 2 ratings.
  const agg = await prisma.rating.aggregate({ where: { rateeId }, _avg: { stars: true }, _count: true });
  const avg = agg._avg.stars ?? null;
  let flagged = false;
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
      await notify({
        userId: rateeId,
        type: "ACCOUNT_FLAGGED",
        title: "Your account has been flagged",
        body: "Your average rating dropped below 3.0. Admins will review your account.",
      });
      flagged = true;
    }
  }

  return NextResponse.json({ ok: true, average: avg, flagged });
}
