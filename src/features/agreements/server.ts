import { prisma } from "@/lib/db";
import { audit, statusChange } from "@/lib/audit";
import { HttpError } from "@/lib/http";
import type { Session } from "@/lib/session";
import { notify } from "@/features/notifications/server";
import { AGREEMENT_VERSION, bothAccepted, snapshotTerms } from "./agreement";

async function partyTo(session: Session, commissionId: string) {
  const commission = await prisma.commission.findUnique({ where: { id: commissionId }, include: { agreements: true } });
  if (!commission) throw new HttpError(404, "Commission not found.");
  const isParty = session.userId === commission.commissionerId || session.userId === commission.awardedToId;
  if (!isParty) throw new HttpError(403, "Only the poster and the hired student can act on this agreement.");
  return commission;
}

/** Acceptances on a commission, visible to the two parties and admins. */
export async function getAgreement(session: Session | null, commissionId: string) {
  if (!session) return null;
  const commission = await prisma.commission.findUnique({ where: { id: commissionId }, select: { commissionerId: true, awardedToId: true } });
  if (!commission) return null;
  const allowed = session.role === "ADMIN" || session.userId === commission.commissionerId || session.userId === commission.awardedToId;
  if (!allowed) return null;
  const acceptances = await prisma.agreementAcceptance.findMany({
    where: { commissionId },
    orderBy: { acceptedAt: "asc" },
    include: { user: { select: { fullName: true } } },
  });
  return { acceptances, version: AGREEMENT_VERSION };
}

/** A party accepts the current agreement; when both have, the commission starts. */
export async function acceptAgreement(session: Session, commissionId: string) {
  const commission = await partyTo(session, commissionId);
  if (commission.status !== "AGREEMENT_PENDING") throw new HttpError(400, "This commission isn't waiting for an agreement.");
  if (commission.agreements.some((a) => a.userId === session.userId && a.version === AGREEMENT_VERSION)) {
    throw new HttpError(409, "You've already accepted this agreement.");
  }

  const terms = snapshotTerms(commission);
  const passedOver = await prisma.application.findMany({ where: { commissionId, status: "PENDING" }, select: { applicantId: true } });
  const starts = bothAccepted([...commission.agreements, { userId: session.userId, version: AGREEMENT_VERSION }], commission);
  await prisma.$transaction([
    prisma.agreementAcceptance.create({ data: { commissionId, userId: session.userId, version: AGREEMENT_VERSION, terms } }),
    audit({ actorId: session.userId, action: "AGREEMENT_ACCEPTED", target: commissionId, after: { version: AGREEMENT_VERSION, ...terms } }),
    ...(starts
      ? [
          prisma.commission.update({ where: { id: commissionId }, data: { status: "IN_PROGRESS" } }),
          // Now that the job is certain, the other applicants hear back.
          prisma.application.updateMany({ where: { commissionId, status: "PENDING" }, data: { status: "REJECTED" } }),
          audit(statusChange(session.userId, commissionId, "AGREEMENT_PENDING", "IN_PROGRESS")),
        ]
      : []),
  ]);

  const other = session.userId === commission.commissionerId ? commission.awardedToId! : commission.commissionerId;
  await notify({
    userId: other,
    type: "AGREEMENT",
    title: starts ? "Work can start" : "Your turn to accept the agreement",
    body: starts ? `Both of you accepted the agreement for "${commission.title}".` : `${session.fullName} accepted the agreement for "${commission.title}".`,
    link: `/commission/${commissionId}`,
  });
  if (starts) {
    await Promise.all(
      passedOver.map((a) =>
        notify({ userId: a.applicantId, type: "APPLICATION_DECLINED", title: "Application not selected", body: `Someone else is doing "${commission.title}".`, link: "/browse" }),
      ),
    );
  }
  return { started: starts };
}

/** Either party backs out before work starts: the commission reopens for applications. */
export async function declineAgreement(session: Session, commissionId: string, reason?: string) {
  const commission = await partyTo(session, commissionId);
  if (commission.status !== "AGREEMENT_PENDING") throw new HttpError(400, "This commission isn't waiting for an agreement.");
  const workerId = commission.awardedToId!;
  const byWorker = session.userId === workerId;

  await prisma.$transaction([
    prisma.application.updateMany({
      where: { commissionId, applicantId: workerId, status: "ACCEPTED" },
      data: { status: byWorker ? "WITHDRAWN" : "REJECTED" },
    }),
    prisma.commission.update({ where: { id: commissionId }, data: { status: "OPEN", awardedToId: null } }),
    audit({ actorId: session.userId, action: "AGREEMENT_DECLINED", target: commissionId, meta: { reason, hired: workerId } }),
    audit(statusChange(session.userId, commissionId, "AGREEMENT_PENDING", "OPEN")),
  ]);
  await notify({
    userId: byWorker ? commission.commissionerId : workerId,
    type: "AGREEMENT",
    title: "The agreement was declined",
    body: `${session.fullName} declined the agreement for "${commission.title}"${reason ? `: ${reason}` : "."}`,
    link: byWorker ? `/hiring/applicants?commissionId=${commissionId}` : "/browse",
  });
  return {};
}
