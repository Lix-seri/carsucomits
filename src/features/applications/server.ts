import { prisma } from "@/lib/db";
import { HttpError } from "@/lib/http";
import type { Session } from "@/lib/session";
import { notify } from "@/features/notifications/server";
import { averageRatings } from "@/features/ratings/server";
import type { ApplyInput } from "./schemas";

export async function applyToCommission(session: Session, commissionId: string, input: ApplyInput) {
  const commission = await prisma.commission.findUnique({ where: { id: commissionId } });
  if (!commission) throw new HttpError(404, "Commission not found.");
  if (commission.status !== "OPEN") throw new HttpError(400, "This commission is no longer accepting applications.");
  if (commission.commissionerId === session.userId) throw new HttpError(400, "You cannot apply to your own commission.");

  // REQ-3.4: one application per person per commission (also a unique index).
  // A withdrawn application can be reopened; anything else is a duplicate.
  const existing = await prisma.application.findUnique({
    where: { commissionId_applicantId: { commissionId, applicantId: session.userId } },
  });
  if (existing && existing.status !== "WITHDRAWN") throw new HttpError(409, "You have already applied to this commission.");

  const fields = { coverLetter: input.coverLetter, proposedRate: input.proposedRate, status: "PENDING" as const };
  const application = existing
    ? await prisma.application.update({ where: { id: existing.id }, data: fields })
    : await prisma.application.create({ data: { commissionId, applicantId: session.userId, ...fields } });

  // REQ-3.3: tell the commissioner.
  await notify({
    userId: commission.commissionerId,
    type: "APPLICATION_RECEIVED",
    title: "New applicant on your commission",
    body: `${session.fullName} applied to "${commission.title}".`,
    link: `/commissioner/applicants?commissionId=${commission.id}`,
  });
  return { application };
}

async function pendingApplicationOnMyCommission(session: Session, id: string, verb: string) {
  const application = await prisma.application.findUnique({ where: { id }, include: { commission: true } });
  if (!application) throw new HttpError(404, "Application not found.");
  if (application.commission.commissionerId !== session.userId) {
    throw new HttpError(403, `Only the commissioner who posted this listing can ${verb}.`);
  }
  if (application.status !== "PENDING") throw new HttpError(400, "This application has already been decided.");
  return application;
}

/** REQ-4.2: accept one applicant, reject the other pending ones, commission → IN_PROGRESS. */
export async function acceptApplication(session: Session, id: string) {
  const application = await pendingApplicationOnMyCommission(session, id, "accept");
  if (application.commission.status !== "OPEN") throw new HttpError(400, "This commission has already been awarded.");

  await prisma.$transaction([
    prisma.application.update({ where: { id }, data: { status: "ACCEPTED" } }),
    prisma.application.updateMany({
      where: { commissionId: application.commissionId, NOT: { id }, status: "PENDING" },
      data: { status: "REJECTED" },
    }),
    prisma.commission.update({
      where: { id: application.commissionId },
      data: { status: "IN_PROGRESS", awardedToId: application.applicantId },
    }),
  ]);

  await notify({
    userId: application.applicantId,
    type: "APPLICATION_ACCEPTED",
    title: "Your application was accepted!",
    body: `You're awarded "${application.commission.title}". Time to get to work.`,
    link: `/hub`,
  });
  const rejected = await prisma.application.findMany({
    where: { commissionId: application.commissionId, status: "REJECTED" },
    select: { applicantId: true },
  });
  await Promise.all(
    rejected.map((r) =>
      notify({
        userId: r.applicantId,
        type: "APPLICATION_DECLINED",
        title: "Application not selected",
        body: `Another applicant was awarded "${application.commission.title}". Keep applying!`,
        link: `/browse`,
      }),
    ),
  );
  return {};
}

/** REQ-4.3 */
export async function declineApplication(session: Session, id: string) {
  const application = await pendingApplicationOnMyCommission(session, id, "decline");
  await prisma.application.update({ where: { id }, data: { status: "REJECTED" } });
  await notify({
    userId: application.applicantId,
    type: "APPLICATION_DECLINED",
    title: "Application declined",
    body: `Your application for "${application.commission.title}" was declined.`,
    link: `/browse`,
  });
  return {};
}

/** The applicant cancels their own pending application. */
export async function withdrawApplication(session: Session, id: string) {
  const application = await prisma.application.findUnique({
    where: { id },
    include: { commission: { select: { id: true, title: true, commissionerId: true, status: true } } },
  });
  if (!application) throw new HttpError(404, "Application not found.");
  if (application.applicantId !== session.userId) throw new HttpError(403, "You can only withdraw your own application.");
  if (application.status !== "PENDING") throw new HttpError(400, "Only pending applications can be withdrawn.");
  if (application.commission.status !== "OPEN") throw new HttpError(400, "This commission is no longer accepting changes.");

  await prisma.application.update({ where: { id }, data: { status: "WITHDRAWN" } });
  await notify({
    userId: application.commission.commissionerId,
    type: "APPLICATION_DECLINED",
    title: "An applicant withdrew",
    body: `${session.fullName} withdrew their application for "${application.commission.title}".`,
    link: `/commissioner/applicants?commissionId=${application.commission.id}`,
  });
  return {};
}

/** Applications on my commissions (optionally one commission, or only pending), with each applicant's average rating. */
export async function listApplicantsForMe(session: Session, opts: { commissionId?: string; pendingOnly?: boolean; take?: number } = {}) {
  const applications = await prisma.application.findMany({
    where: {
      commission: { commissionerId: session.userId },
      ...(opts.commissionId ? { commissionId: opts.commissionId } : {}),
      ...(opts.pendingOnly ? { status: "PENDING" as const } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      applicant: { select: { id: true, fullName: true, avatarUrl: true } },
      commission: { select: { id: true, title: true, status: true } },
    },
    take: opts.take,
  });
  return { applications, avgRating: await averageRatings(applications.map((a) => a.applicantId)) };
}
