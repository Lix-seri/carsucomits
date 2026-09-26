import { put, del } from "@vercel/blob";
import type { SkillLevel } from "@prisma/client";
import { prisma } from "@/lib/db";
import { UNFINISHED_STATUSES } from "@/lib/labels";
import { HttpError } from "@/lib/http";
import type { Session } from "@/lib/session";
import { getRatingDistribution, getRecentReviews } from "@/features/ratings/server";
import { AVATAR_TYPES } from "./schemas";

export async function getUserSkills(userId: string) {
  return prisma.skill.findMany({ where: { userId }, orderBy: { createdAt: "asc" } });
}

export async function getUserStats(userId: string) {
  const [done, posted, ratingAgg, reviewCount, totalAsApplicant] = await Promise.all([
    prisma.application.count({ where: { applicantId: userId, status: "ACCEPTED", commission: { status: "COMPLETED" } } }),
    prisma.commission.count({ where: { commissionerId: userId } }),
    prisma.rating.aggregate({ where: { rateeId: userId }, _avg: { stars: true } }),
    prisma.rating.count({ where: { rateeId: userId } }),
    prisma.application.count({ where: { applicantId: userId, status: { in: ["ACCEPTED", "REJECTED"] } } }),
  ]);
  const rating = ratingAgg._avg.stars ?? null;
  const successRate = totalAsApplicant > 0 ? Math.round((done / totalAsApplicant) * 100) : null;
  return { done, posted, rating, reviewCount, successRate };
}

/**
 * Item 4: how many unfinished jobs each person holds right now. Derived from their commissions
 * on every read, so it can't go stale. Zero means Available; more means Busy.
 */
export async function activeJobCounts(userIds: string[]) {
  const rows = userIds.length
    ? await prisma.commission.groupBy({ by: ["awardedToId"], where: { awardedToId: { in: userIds }, status: { in: [...UNFINISHED_STATUSES] } }, _count: true })
    : [];
  const counts = new Map(rows.map((r) => [r.awardedToId!, r._count]));
  return new Map(userIds.map((id) => [id, counts.get(id) ?? 0]));
}

/** Everything the profile pages show below the header. */
export async function getProfileDetails(userId: string, reviewCount: number) {
  const [skills, stats, reviews, distribution, jobs] = await Promise.all([
    getUserSkills(userId),
    getUserStats(userId),
    getRecentReviews(userId, reviewCount),
    getRatingDistribution(userId),
    activeJobCounts([userId]),
  ]);
  return { skills, stats, reviews, distribution, activeJobs: jobs.get(userId) ?? 0 };
}

export async function getPublicUser(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, fullName: true, avatarUrl: true, role: true, status: true, bio: true, createdAt: true, verifiedAt: true },
  });
}

/** Uploads to Vercel Blob (public: fine for avatars) and replaces the previous avatar. */
export async function uploadAvatar(session: Session, file: File) {
  const ext = AVATAR_TYPES[file.type];

  const uploaded = await put(`avatars/${session.userId}-${Date.now()}.${ext}`, file, { access: "public", contentType: file.type });
  await deleteBlob(session.avatarUrl);
  await prisma.user.update({ where: { id: session.userId }, data: { avatarUrl: uploaded.url } });
  return { url: uploaded.url };
}

export async function removeAvatar(session: Session) {
  await deleteBlob(session.avatarUrl);
  await prisma.user.update({ where: { id: session.userId }, data: { avatarUrl: null } });
  return {};
}

/** Best-effort cleanup of an old Blob file. */
export async function deleteBlob(url: string | null | undefined) {
  if (!url?.startsWith("https://")) return;
  try {
    await del(url);
  } catch {
    /* already gone */
  }
}

export async function addSkill(session: Session, { name, level }: { name: string; level: SkillLevel }) {
  const skill = await prisma.skill.create({ data: { userId: session.userId, name, level } });
  return { skill };
}

export async function removeSkill(session: Session, id: string) {
  const skill = await prisma.skill.findUnique({ where: { id } });
  // 404 (not 403) for someone else's skill, so ids can't be probed.
  if (!skill || skill.userId !== session.userId) throw new HttpError(404, "Skill not found.");
  await prisma.skill.delete({ where: { id } });
  return {};
}
