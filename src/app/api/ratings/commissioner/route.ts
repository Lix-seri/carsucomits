import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { notify } from "@/features/notifications/server";

// POST /api/ratings/commissioner — awarded student rates the commissioner after completion.
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { commissionId, stars, comment } = await req.json();
  const starsNum = Number(stars);
  if (!Number.isInteger(starsNum) || starsNum < 1 || starsNum > 5) {
    return NextResponse.json({ error: "Stars must be 1–5." }, { status: 400 });
  }
  if (starsNum <= 3 && (!comment || String(comment).trim().length < 10)) {
    return NextResponse.json({ error: "Please leave at least 10 characters of feedback for ratings of 3 or below." }, { status: 400 });
  }

  const commission = await prisma.commission.findUnique({ where: { id: commissionId } });
  if (!commission) return NextResponse.json({ error: "Commission not found." }, { status: 404 });
  if (commission.status !== "COMPLETED") {
    return NextResponse.json({ error: "You can only rate the commissioner after the job is completed." }, { status: 400 });
  }
  if (commission.awardedToId !== session.userId) {
    return NextResponse.json({ error: "Only the awarded student can rate the commissioner." }, { status: 403 });
  }

  const rateeId = commission.commissionerId;
  const trimmedComment = comment ? String(comment).trim() : null;

  await prisma.rating.upsert({
    where: { commissionId_raterId_rateeId: { commissionId, raterId: session.userId, rateeId } },
    update: { stars: starsNum, comment: trimmedComment },
    create: { commissionId, raterId: session.userId, rateeId, stars: starsNum, comment: trimmedComment },
  });

  await notify({
    userId: rateeId,
    type: "RATING_RECEIVED",
    title: `You received a ${starsNum}-star rating from a student`,
    body: trimmedComment ? `"${trimmedComment.slice(0, 80)}"` : `For "${commission.title}"`,
    link: `/profile`,
  });

  return NextResponse.json({ ok: true });
}
