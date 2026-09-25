import { prisma } from "@/lib/db";
import { HttpError } from "@/lib/http";
import type { Session } from "@/lib/session";
import { timeAgo } from "@/lib/format";
import { initialsFor } from "@/components/ui/avatar";
import { notify } from "@/features/notifications/server";

/** Average stars and review count per user, in one query (users with no ratings are absent). */
export async function ratingSummaries(userIds: string[]) {
  const rows = userIds.length
    ? await prisma.rating.groupBy({ by: ["rateeId"], where: { rateeId: { in: userIds } }, _avg: { stars: true }, _count: true })
    : [];
  return new Map(rows.map((r) => [r.rateeId, { avg: r._avg.stars, count: r._count }]));
}

/** userId → average stars, for tables that only show the average. */
export async function averageRatings(userIds: string[]) {
  const summaries = await ratingSummaries(userIds);
  return new Map(Array.from(summaries, ([id, s]) => [id, s.avg]));
}

export async function getRatingDistribution(userId: string) {
  const groups = await prisma.rating.groupBy({ by: ["stars"], where: { rateeId: userId }, _count: true });
  const byStar: Record<number, number> = {};
  for (const g of groups) byStar[g.stars] = g._count;
  return byStar;
}

export async function getRecentReviews(userId: string, take = 3) {
  const reviews = await prisma.rating.findMany({
    where: { rateeId: userId },
    orderBy: { createdAt: "desc" },
    take,
    include: { rater: { select: { fullName: true } } },
  });
  return reviews.map((r) => ({
    who: r.rater.fullName,
    initials: initialsFor(r.rater.fullName),
    stars: r.stars,
    comment: r.comment,
    when: timeAgo(r.createdAt),
  }));
}

type RatingInput = { stars?: unknown; comment?: unknown };

function parseRating(input: RatingInput, starsError: string) {
  const stars = Number(input.stars);
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) throw new HttpError(400, starsError);
  const comment = input.comment ? String(input.comment).trim() : null;
  if (stars <= 3 && (!comment || comment.length < 10)) {
    throw new HttpError(400, "Please leave at least 10 characters of feedback for ratings of 3 or below.");
  }
  return { stars, comment };
}

/** REQ-5.3: warn an ACTIVE user whose average drops below 3.0 over at least 2 ratings. */
async function flagIfLowRating(actorId: string, rateeId: string, notifyUser: boolean) {
  const agg = await prisma.rating.aggregate({ where: { rateeId }, _avg: { stars: true }, _count: true });
  const avg = agg._avg.stars ?? null;
  if (avg == null || agg._count < 2 || avg >= 3.0) return { avg, flagged: false };

  const target = await prisma.user.findUnique({ where: { id: rateeId }, select: { status: true } });
  if (target?.status !== "ACTIVE") return { avg, flagged: false };

  await prisma.user.update({ where: { id: rateeId }, data: { status: "WARNED" } });
  await prisma.auditLog.create({
    data: { actorId, action: "AUTO_FLAG_LOW_RATING", target: rateeId, meta: JSON.stringify({ avg, ratingCount: agg._count }) },
  });
  if (notifyUser) {
    await notify({
      userId: rateeId,
      type: "ACCOUNT_FLAGGED",
      title: "Your account has been flagged",
      body: "Your average rating dropped below 3.0. Admins will review your account.",
    });
  }
  return { avg, flagged: true };
}

function upsertRating(commissionId: string, raterId: string, rateeId: string, stars: number, comment: string | null) {
  return prisma.rating.upsert({
    where: { commissionId_raterId_rateeId: { commissionId, raterId, rateeId } },
    update: { stars, comment },
    create: { commissionId, raterId, rateeId, stars, comment },
  });
}

const ratingNote = (comment: string | null, title: string) => (comment ? `"${comment.slice(0, 80)}"` : `For "${title}"`);

/** REQ-4.4 + REQ-5.1: the commissioner marks the job complete and rates the student in one transaction. */
export async function completeWithRating(session: Session, commissionId: string, input: RatingInput) {
  const { stars, comment } = parseRating(input, "A 1–5 star rating is required to mark the commission complete.");
  const commission = await prisma.commission.findUnique({ where: { id: commissionId } });
  if (!commission) throw new HttpError(404, "Commission not found.");
  if (commission.commissionerId !== session.userId) throw new HttpError(403, "Only the commissioner can mark this completed.");
  if (commission.status !== "IN_PROGRESS") throw new HttpError(400, "Only in-progress commissions can be marked completed.");
  if (!commission.awardedToId) throw new HttpError(400, "No applicant has been awarded yet.");

  const rateeId = commission.awardedToId;
  await prisma.$transaction([
    upsertRating(commissionId, session.userId, rateeId, stars, comment),
    prisma.commission.update({ where: { id: commissionId }, data: { status: "COMPLETED" } }),
  ]);

  await notify({
    userId: rateeId,
    type: "COMMISSION_COMPLETED",
    title: "Commission marked completed",
    body: `"${commission.title}" was marked completed. You received a ${stars}-star rating!`,
    link: `/profile`,
  });
  await notify({
    userId: rateeId,
    type: "RATING_RECEIVED",
    title: `You received a ${stars}-star rating`,
    body: ratingNote(comment, commission.title),
    link: `/profile`,
  });

  const { avg, flagged } = await flagIfLowRating(session.userId, rateeId, true);
  return { average: avg, flagged };
}

/** Rate a commission that was completed before ratings were mandatory. */
export async function rateRetroactively(session: Session, commissionId: string, input: RatingInput) {
  const { stars, comment } = parseRating(input, "Stars must be 1–5.");
  const commission = await prisma.commission.findUnique({ where: { id: commissionId } });
  if (!commission) throw new HttpError(404, "Commission not found.");
  if (commission.commissionerId !== session.userId) throw new HttpError(403, "Only the commissioner can rate this.");
  if (commission.status !== "COMPLETED") throw new HttpError(400, "Only completed commissions can be rated retroactively.");
  if (!commission.awardedToId) throw new HttpError(400, "No applicant was awarded.");

  const rateeId = commission.awardedToId;
  await upsertRating(commissionId, session.userId, rateeId, stars, comment);
  await notify({
    userId: rateeId,
    type: "RATING_RECEIVED",
    title: `You received a ${stars}-star rating`,
    body: ratingNote(comment, commission.title),
    link: `/profile`,
  });

  // Same as the old route: this path never told the user they were flagged (fixed in Phase 2).
  const { avg } = await flagIfLowRating(session.userId, rateeId, false);
  return { average: avg };
}

/** The awarded student rates the commissioner after completion. */
export async function rateCommissioner(session: Session, input: RatingInput & { commissionId?: unknown }) {
  const { stars, comment } = parseRating(input, "Stars must be 1–5.");
  const commissionId = typeof input.commissionId === "string" ? input.commissionId : "";
  const commission = commissionId ? await prisma.commission.findUnique({ where: { id: commissionId } }) : null;
  if (!commission) throw new HttpError(404, "Commission not found.");
  if (commission.status !== "COMPLETED") throw new HttpError(400, "You can only rate the commissioner after the job is completed.");
  if (commission.awardedToId !== session.userId) throw new HttpError(403, "Only the awarded student can rate the commissioner.");

  const rateeId = commission.commissionerId;
  await upsertRating(commissionId, session.userId, rateeId, stars, comment);
  await notify({
    userId: rateeId,
    type: "RATING_RECEIVED",
    title: `You received a ${stars}-star rating from a student`,
    body: ratingNote(comment, commission.title),
    link: `/profile`,
  });
  return {};
}
