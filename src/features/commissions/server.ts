import { put } from "@vercel/blob";
import type { z } from "zod";
import { CommissionStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { audit } from "@/lib/audit";
import { HttpError } from "@/lib/http";
import type { Session } from "@/lib/session";
import { deleteBlob } from "@/features/profile/server";
import { IMAGE_TYPES, type CreateCommissionInput, type listCommissionsSchema } from "./schemas";

/** Browse listing: filter by category, level, free text and status (default OPEN). */
export async function listCommissions(filters: z.infer<typeof listCommissionsSchema>, take = 50) {
  const { category, level, q, status } = filters;
  const commissions = await prisma.commission.findMany({
    where: {
      status,
      ...(category ? { category } : {}),
      ...(level ? { requiredLevel: level } : {}),
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
    take,
  });
  return { commissions };
}

export async function createCommission(session: Session, input: CreateCommissionInput) {
  const commission = await prisma.commission.create({
    data: {
      ...input,
      deadline: input.deadline ? new Date(input.deadline) : null,
      commissionerId: session.userId,
      status: CommissionStatus.OPEN,
    },
  });
  await audit({ actorId: session.userId, action: "COMMISSION_CREATED", target: commission.id, after: { status: "OPEN", title: commission.title, fareMin: commission.fareMin, fareMax: commission.fareMax } });
  return { commission };
}

async function ownCommission(session: Session, id: string, action: string) {
  const commission = await prisma.commission.findUnique({ where: { id } });
  if (!commission) throw new HttpError(404, "Commission not found.");
  if (commission.commissionerId !== session.userId) throw new HttpError(403, `Only the owner can ${action} the cover image.`);
  return commission;
}

export async function setCover(session: Session, id: string, file: File) {
  const commission = await ownCommission(session, id, "change");
  const ext = IMAGE_TYPES[file.type];

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

  const [commissionerRating, myApplication, savedRow, awardee] = await Promise.all([
    prisma.rating.aggregate({ where: { rateeId: commission.commissionerId }, _avg: { stars: true } }),
    session
      ? prisma.application.findUnique({ where: { commissionId_applicantId: { commissionId: id, applicantId: session.userId } } })
      : null,
    session ? prisma.savedCommission.findUnique({ where: { userId_commissionId: { userId: session.userId, commissionId: id } } }) : null,
    commission.awardedToId ? prisma.user.findUnique({ where: { id: commission.awardedToId }, select: { fullName: true } }) : null,
  ]);
  return { commission, commissionerAvg: commissionerRating._avg.stars, myApplication, saved: !!savedRow, awardeeName: awardee?.fullName ?? "the student" };
}

export async function getMyListings(userId: string, statuses?: CommissionStatus[], take?: number) {
  return prisma.commission.findMany({
    where: { commissionerId: userId, ...(statuses ? { status: { in: statuses } } : {}) },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { applications: true } } },
    take,
  });
}
