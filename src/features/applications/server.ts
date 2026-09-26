import { prisma } from "@/lib/db";
import { UNFINISHED_STATUSES } from "@/lib/labels";
import { audit, statusChange } from "@/lib/audit";
import { HttpError } from "@/lib/http";
import type { Session } from "@/lib/session";
import { notify } from "@/features/notifications/server";
import { averageRatings } from "@/features/ratings/server";
import { activeJobCounts } from "@/features/profile/server";
import { applyBlockedReason, getLimits } from "@/features/settings/server";
import { isVerified, NOT_VERIFIED } from "@/features/verification/server";
import { recordFlag, screenText } from "@/features/moderation/server";
import type { ApplyInput } from "./schemas";

export async function applyToCommission(session: Session, commissionId: string, input: ApplyInput) {
  const commission = await prisma.commission.findUnique({ where: { id: commissionId } });
  if (!commission) throw new HttpError(404, "Commission not found.");
  if (commission.status !== "OPEN") throw new HttpError(400, "This commission is no longer accepting applications.");
  if (commission.commissionerId === session.userId) throw new HttpError(400, "You cannot apply to your own commission.");
  // Item 6: only verified CCIS students offer their services (decision 0012).
  if (!session.verified) throw new HttpError(403, NOT_VERIFIED);

  // REQ-3.4: one application per person per commission (also a unique index).
  // A withdrawn application can be reopened; anything else is a duplicate.
  const existing = await prisma.application.findUnique({
    where: { commissionId_applicantId: { commissionId, applicantId: session.userId } },
  });
  if (existing && existing.status !== "WITHDRAWN") throw new HttpError(409, "You have already applied to this commission.");

  // Item 3: caps on pending applications and unfinished jobs (admin setting, decision 0010).
  const blocked = applyBlockedReason(await workload(session.userId), await getLimits());
  if (blocked) throw new HttpError(409, blocked);

  const fields = { coverLetter: input.coverLetter, proposedRate: input.proposedRate, status: "PENDING" as const };
  const application = existing
    ? await prisma.application.update({ where: { id: existing.id }, data: fields })
    : await prisma.application.create({ data: { commissionId, applicantId: session.userId, ...fields } });

  const hit = input.coverLetter ? await screenText(input.coverLetter) : null;
  if (hit) await recordFlag(session.userId, "APPLICATION", application.id, input.coverLetter!, hit);

  // REQ-3.3: tell the commissioner.
  await notify({
    userId: commission.commissionerId,
    type: "APPLICATION_RECEIVED",
    title: "New applicant on your commission",
    body: `${session.fullName} applied to "${commission.title}".`,
    link: `/hiring/applicants?commissionId=${commission.id}`,
  });
  return { application };
}

/** Unfinished jobs are hired commissions not yet completed; they count against the hold cap. */

async function workload(userId: string) {
  const [pending, active] = await Promise.all([
    prisma.application.count({ where: { applicantId: userId, status: "PENDING" } }),
    prisma.commission.count({ where: { awardedToId: userId, status: { in: [...UNFINISHED_STATUSES] } } }),
  ]);
  return { pending, active };
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

/**
 * REQ-4.2: hire one applicant. The commission waits for both parties to accept the agreement
 * (decision 0013); the other applicants stay pending until work actually starts.
 */
export async function acceptApplication(session: Session, id: string) {
  const application = await pendingApplicationOnMyCommission(session, id, "accept");
  if (application.commission.status !== "OPEN") throw new HttpError(400, "This commission has already been awarded.");
  // A seller suspended after applying can't be hired.
  if (!(await isVerified(application.applicantId))) throw new HttpError(400, "This student's CCIS verification is no longer active, so they can't be hired.");
  // The hold cap also applies at hiring, so applying early can't get around it.
  const { active } = await workload(application.applicantId);
  const { MAX_ACTIVE_JOBS } = await getLimits();
  if (active >= MAX_ACTIVE_JOBS) {
    throw new HttpError(409, `This student is already working on ${active} commission${active === 1 ? "" : "s"}, the most allowed at once. Try another applicant or ask them to finish one first.`);
  }

  await prisma.$transaction([
    prisma.application.update({ where: { id }, data: { status: "ACCEPTED" } }),
    prisma.commission.update({
      where: { id: application.commissionId },
      data: { status: "AGREEMENT_PENDING", awardedToId: application.applicantId },
    }),
    audit({ actorId: session.userId, action: "APPLICATION_ACCEPTED", target: application.applicantId, before: { status: "PENDING" }, after: { status: "ACCEPTED" }, meta: { applicationId: id, commissionId: application.commissionId } }),
    audit(statusChange(session.userId, application.commissionId, "OPEN", "AGREEMENT_PENDING")),
  ]);

  await notify({
    userId: application.applicantId,
    type: "APPLICATION_ACCEPTED",
    title: "You're hired. Review the agreement",
    body: `You were picked for "${application.commission.title}". Accept the agreement to start.`,
    link: `/commission/${application.commissionId}`,
  });
  return {};
}

/** REQ-4.3 */
export async function declineApplication(session: Session, id: string) {
  const application = await pendingApplicationOnMyCommission(session, id, "decline");
  await prisma.$transaction([
    prisma.application.update({ where: { id }, data: { status: "REJECTED" } }),
    audit({ actorId: session.userId, action: "APPLICATION_DECLINED", target: application.applicantId, before: { status: "PENDING" }, after: { status: "REJECTED" }, meta: { applicationId: id, commissionId: application.commissionId } }),
  ]);
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
    link: `/hiring/applicants?commissionId=${application.commission.id}`,
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
      applicant: { select: { id: true, fullName: true, avatarUrl: true, verifiedAt: true } },
      commission: { select: { id: true, title: true, status: true } },
    },
    take: opts.take,
  });
  const ids = applications.map((a) => a.applicantId);
  const [avgRating, activeJobs] = await Promise.all([averageRatings(ids), activeJobCounts(ids)]);
  return { applications, avgRating, activeJobs };
}
