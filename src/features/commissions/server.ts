import { put } from "@vercel/blob";
import { Category, CommissionStatus, SkillLevel } from "@prisma/client";
import { prisma } from "@/lib/db";
import { HttpError } from "@/lib/http";
import type { Session } from "@/lib/session";
import { deleteBlob } from "@/features/profile/server";

const VALID_CATS = Object.values(Category);
const VALID_LEVELS = Object.values(SkillLevel);
const VALID_STATUSES = Object.values(CommissionStatus);

/** Browse listing: filter by category, level, free text and status (default OPEN). */
export async function listCommissions(params: URLSearchParams) {
  const category = params.get("category");
  const level = params.get("level");
  const q = params.get("q");
  const statusParam = params.get("status") ?? "OPEN";
  const status = VALID_STATUSES.includes(statusParam as CommissionStatus) ? (statusParam as CommissionStatus) : CommissionStatus.OPEN;

  const commissions = await prisma.commission.findMany({
    where: {
      status,
      ...(category && VALID_CATS.includes(category as Category) ? { category: category as Category } : {}),
      ...(level && VALID_LEVELS.includes(level as SkillLevel) ? { requiredLevel: level as SkillLevel } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" as const } },
              { description: { contains: q, mode: "insensitive" as const } },
              { subcategory: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      commissioner: { select: { fullName: true, avatarUrl: true } },
      _count: { select: { applications: true } },
    },
    take: 50,
  });
  return { commissions };
}

type CreateInput = Record<string, unknown>;

export async function createCommission(session: Session, body: CreateInput) {
  const { title, description, category, subcategory, requiredLevel, fareMin, fareMax, fareUnit, deadline } = body;
  if (!title || !description || !category || !requiredLevel || fareMin == null) {
    throw new HttpError(400, "Title, description, category, skill level, and fare are required.");
  }
  if (!VALID_CATS.includes(category as Category)) throw new HttpError(400, "Invalid category.");
  if (!VALID_LEVELS.includes(requiredLevel as SkillLevel)) throw new HttpError(400, "Invalid skill level.");
  if (Number(fareMin) < 0) throw new HttpError(400, "Fare must be a positive number.");

  const commission = await prisma.commission.create({
    data: {
      title: String(title).trim(),
      description: String(description).trim(),
      category: category as Category,
      subcategory: subcategory ? String(subcategory).trim() : null,
      requiredLevel: requiredLevel as SkillLevel,
      fareMin: Number(fareMin),
      fareMax: fareMax != null ? Number(fareMax) : null,
      fareUnit: fareUnit ? String(fareUnit).trim() : null,
      deadline: deadline ? new Date(String(deadline)) : null,
      commissionerId: session.userId,
      status: CommissionStatus.OPEN,
    },
  });
  return { commission };
}

async function ownCommission(session: Session, id: string, action: string) {
  const commission = await prisma.commission.findUnique({ where: { id } });
  if (!commission) throw new HttpError(404, "Commission not found.");
  if (commission.commissionerId !== session.userId) throw new HttpError(403, `Only the owner can ${action} the cover image.`);
  return commission;
}

const COVER_MAX_BYTES = 5 * 1024 * 1024;
const COVER_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export async function setCover(session: Session, id: string, file: FormDataEntryValue | null) {
  const commission = await ownCommission(session, id, "change");
  if (!(file instanceof File)) throw new HttpError(400, "No file uploaded.");
  const ext = COVER_TYPES[file.type];
  if (!ext) throw new HttpError(400, "Use JPG, PNG, or WebP.");
  if (file.size > COVER_MAX_BYTES) throw new HttpError(400, "Max file size is 5 MB.");

  const uploaded = await put(`commissions/${commission.id}-${Date.now()}.${ext}`, file, { access: "public", contentType: file.type });
  await deleteBlob(commission.coverImageUrl);
  await prisma.commission.update({ where: { id }, data: { coverImageUrl: uploaded.url } });
  return { url: uploaded.url };
}

export async function removeCover(session: Session, id: string) {
  const commission = await ownCommission(session, id, "remove");
  await deleteBlob(commission.coverImageUrl);
  await prisma.commission.update({ where: { id }, data: { coverImageUrl: null } });
  return {};
}

/** Bookmark on/off. */
export async function toggleSaved(session: Session, commissionId: string) {
  const commission = await prisma.commission.findUnique({ where: { id: commissionId } });
  if (!commission) throw new HttpError(404, "Commission not found.");
  const key = { userId_commissionId: { userId: session.userId, commissionId } };
  const existing = await prisma.savedCommission.findUnique({ where: key });
  if (existing) {
    await prisma.savedCommission.delete({ where: { id: existing.id } });
    return { saved: false };
  }
  await prisma.savedCommission.create({ data: { userId: session.userId, commissionId } });
  return { saved: true };
}

export async function getSavedCommissions(userId: string) {
  return prisma.savedCommission.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      commission: {
        include: { commissioner: { select: { fullName: true } }, _count: { select: { applications: true } } },
      },
    },
  });
}

/** Everything the commission detail page needs, from the viewer's point of view. */
export async function getCommissionDetail(id: string, session: Session | null) {
  const commission = await prisma.commission.findUnique({
    where: { id },
    include: {
      commissioner: { select: { id: true, fullName: true, avatarUrl: true, _count: { select: { postedCommissions: true } } } },
      _count: { select: { applications: true } },
    },
  });
  if (!commission) return null;

  const [commissionerRating, myApplication, savedRow] = await Promise.all([
    prisma.rating.aggregate({ where: { rateeId: commission.commissionerId }, _avg: { stars: true } }),
    session
      ? prisma.application.findUnique({ where: { commissionId_applicantId: { commissionId: id, applicantId: session.userId } } })
      : null,
    session ? prisma.savedCommission.findUnique({ where: { userId_commissionId: { userId: session.userId, commissionId: id } } }) : null,
  ]);
  return { commission, commissionerAvg: commissionerRating._avg.stars, myApplication, saved: !!savedRow };
}

export async function getMyListings(userId: string, statuses?: CommissionStatus[], take?: number) {
  return prisma.commission.findMany({
    where: { commissionerId: userId, ...(statuses ? { status: { in: statuses } } : {}) },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { applications: true } } },
    take,
  });
}
