import { put } from "@vercel/blob";
import { prisma } from "@/lib/db";
import { audit, statusChange } from "@/lib/audit";
import { HttpError } from "@/lib/http";
import type { Session } from "@/lib/session";
import { notify } from "@/features/notifications/server";

export async function listDeliverables(commissionId: string) {
  return prisma.deliverable.findMany({
    where: { commissionId },
    orderBy: { submittedAt: "desc" },
    include: { submitter: { select: { fullName: true, avatarUrl: true } } },
  });
}

/** The awarded student uploads a file; the commission moves to AWAITING_REVIEW. */
export async function submitDeliverable(session: Session, commissionId: string, { file, message }: { file: File; message: string | null }) {
  const commission = await prisma.commission.findUnique({ where: { id: commissionId } });
  if (!commission) throw new HttpError(404, "Commission not found.");
  if (commission.awardedToId !== session.userId) throw new HttpError(403, "Only the awarded student can submit deliverables.");
  if (commission.status !== "IN_PROGRESS" && commission.status !== "AWAITING_REVIEW") {
    throw new HttpError(400, "Deliverables can only be submitted while work is in progress.");
  }


  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
  const uploaded = await put(`deliverables/${commission.id}/${Date.now()}-${safeName}`, file, {
    access: "public",
    contentType: file.type,
  });
  const deliverable = await prisma.deliverable.create({
    data: {
      commissionId: commission.id,
      submitterId: session.userId,
      fileUrl: uploaded.url,
      fileName: safeName,
      fileSize: file.size,
      message,
    },
  });
  if (commission.status === "IN_PROGRESS") {
    await prisma.$transaction([
      prisma.commission.update({ where: { id: commission.id }, data: { status: "AWAITING_REVIEW" } }),
      audit(statusChange(session.userId, commission.id, "IN_PROGRESS", "AWAITING_REVIEW")),
    ]);
  }
  await notify({
    userId: commission.commissionerId,
    type: "APPLICATION_RECEIVED",
    title: "New deliverable submitted",
    body: `${session.fullName} submitted "${safeName}" for "${commission.title}".`,
    link: `/commission/${commission.id}`,
  });
  return { deliverable };
}

/** The commissioner approves a deliverable or asks for a revision (back to IN_PROGRESS). */
export async function decideDeliverable(session: Session, id: string, { action, notes }: { action: "APPROVE" | "REQUEST_REVISION"; notes: string | null }) {

  const deliverable = await prisma.deliverable.findUnique({
    where: { id },
    include: { commission: { select: { id: true, title: true, commissionerId: true, awardedToId: true, status: true } } },
  });
  if (!deliverable) throw new HttpError(404, "Deliverable not found.");
  if (deliverable.commission.commissionerId !== session.userId) throw new HttpError(403, "Only the commissioner can review deliverables.");
  if (deliverable.status !== "SUBMITTED") throw new HttpError(400, "This deliverable has already been reviewed.");

  const approve = action === "APPROVE";
  const newStatus = approve ? "APPROVED" : "REVISION_REQUESTED";
  const reopen = !approve && deliverable.commission.status === "AWAITING_REVIEW";
  await prisma.$transaction([
    prisma.deliverable.update({ where: { id }, data: { status: newStatus, reviewerNotes: notes, reviewedAt: new Date() } }),
    audit({ actorId: session.userId, action: approve ? "DELIVERABLE_APPROVED" : "DELIVERABLE_REVISION", target: deliverable.commission.id, before: { status: "SUBMITTED" }, after: { status: newStatus }, meta: { deliverableId: id, notes } }),
    ...(reopen
      ? [
          prisma.commission.update({ where: { id: deliverable.commission.id }, data: { status: "IN_PROGRESS" } }),
          audit(statusChange(session.userId, deliverable.commission.id, "AWAITING_REVIEW", "IN_PROGRESS")),
        ]
      : []),
  ]);
  if (deliverable.commission.awardedToId) {
    await notify({
      userId: deliverable.commission.awardedToId,
      type: approve ? "COMMISSION_COMPLETED" : "APPLICATION_DECLINED",
      title: approve ? "Deliverable approved" : "Revision requested",
      body: approve
        ? `Your deliverable for "${deliverable.commission.title}" was approved.`
        : `The commissioner asked for changes on "${deliverable.commission.title}".`,
      link: `/commission/${deliverable.commission.id}`,
    });
  }
  return {};
}
