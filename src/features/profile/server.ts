import { put, del } from "@vercel/blob";
import { SkillLevel } from "@prisma/client";
import { prisma } from "@/lib/db";
import { HttpError } from "@/lib/http";
import type { Session } from "@/lib/session";
import { getRatingDistribution, getRecentReviews } from "@/features/ratings/server";

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

/** Everything the profile pages show below the header. */
export async function getProfileDetails(userId: string, reviewCount: number) {
  const [skills, stats, reviews, distribution] = await Promise.all([
    getUserSkills(userId),
    getUserStats(userId),
    getRecentReviews(userId, reviewCount),
    getRatingDistribution(userId),
  ]);
  return { skills, stats, reviews, distribution };
}

export async function getPublicUser(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, fullName: true, avatarUrl: true, role: true, status: true, bio: true, createdAt: true },
  });
}

const AVATAR_MAX_BYTES = 5 * 1024 * 1024;
const AVATAR_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };

/** Uploads to Vercel Blob (public: fine for avatars) and replaces the previous avatar. */
export async function uploadAvatar(session: Session, file: FormDataEntryValue | null) {
  if (!(file instanceof File)) throw new HttpError(400, "No file uploaded.");
  const ext = AVATAR_TYPES[file.type];
  if (!ext) throw new HttpError(400, "Use JPG, PNG, WebP, or GIF.");
  if (file.size > AVATAR_MAX_BYTES) throw new HttpError(400, "Max file size is 5 MB.");

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

export async function addSkill(session: Session, input: { name?: unknown; level?: unknown }) {
  const { name, level } = input;
  if (typeof name !== "string" || name.trim().length < 2) throw new HttpError(400, "Skill name is required (min 2 chars).");
  if (!Object.values(SkillLevel).includes(level as SkillLevel)) throw new HttpError(400, "Invalid skill level.");
  const skill = await prisma.skill.create({ data: { userId: session.userId, name: name.trim(), level: level as SkillLevel } });
  return { skill };
}

export async function removeSkill(session: Session, id: string) {
  const skill = await prisma.skill.findUnique({ where: { id } });
  // 404 (not 403) for someone else's skill, so ids can't be probed.
  if (!skill || skill.userId !== session.userId) throw new HttpError(404, "Skill not found.");
  await prisma.skill.delete({ where: { id } });
  return {};
}
