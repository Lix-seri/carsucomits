import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { notify } from "@/lib/notifications";

// POST /api/ratings — REQ-5.1, REQ-5.3
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { commissionId, rateeId, stars, comment } = await req.json();
  if (!commissionId || !rateeId || stars == null) {
    return NextResponse.json({ error: "Missing fields." }, { status: 400 });
  }
  const starsNum = Number(stars);
  if (!Number.isInteger(starsNum) || starsNum < 1 || starsNum > 5) {
    return NextResponse.json({ error: "Stars must be 1–5." }, { status: 400 });
  }

  const commission = await prisma.commission.findUnique({ where: { id: commissionId } });
  if (!commission) return NextResponse.json({ error: "Commission not found." }, { status: 404 });
  if (commission.status !== "COMPLETED") {
    return NextResponse.json({ error: "You can only rate after the commission is completed." }, { status: 400 });
  }
  if (commission.commissionerId !== session.userId) {
    return NextResponse.json({ error: "Only the commissioner who posted this can rate." }, { status: 403 });
  }
  if (commission.awardedToId !== rateeId) {
    return NextResponse.json({ error: "You can only rate the awarded applicant." }, { status: 400 });
  }

  // Upsert in case the modal is re-submitted.
  await prisma.rating.upsert({
    where: { commissionId_raterId_rateeId: { commissionId, raterId: session.userId, rateeId } },
    update: { stars: starsNum, comment: comment ? String(comment).trim() : null },
    create: {
      commissionId,
      raterId: session.userId,
      rateeId,
      stars: starsNum,
      comment: comment ? String(comment).trim() : null,
    },
  });

  // REQ-5.3: auto-flag if the rated user's average drops below 3.0.
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
        body: `Your average rating dropped below 3.0. Admins will review your account.`,
      });
      flagged = true;
    }
  }

  await notify({
    userId: rateeId,
    type: "RATING_RECEIVED",
    title: `You received a ${starsNum}-star rating`,
    body: comment ? `"${String(comment).slice(0, 80)}"` : `For "${commission.title}"`,
    link: `/profile`,
  });

  return NextResponse.json({ ok: true, average: avg, flagged });
}
