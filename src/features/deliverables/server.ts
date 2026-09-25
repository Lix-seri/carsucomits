import { put } from "@vercel/blob";
import { prisma } from "@/lib/db";
import { HttpError } from "@/lib/http";
import type { Session } from "@/lib/session";
import { notify } from "@/features/notifications/server";

const MAX_BYTES = 20 * 1024 * 1024; // 20 MB
const ALLOWED_TYPES = [
  "image/jpeg", "image/png", "image/webp", "image/gif",
  "application/pdf",
  "application/zip", "application/x-zip-compressed",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain", "text/csv",
];

export async function listDeliverables(commissionId: string) {
  return prisma.deliverable.findMany({
    where: { commissionId },
    orderBy: { submittedAt: "desc" },
    include: { submitter: { select: { fullName: true, avatarUrl: true } } },
  });
}

/** The awarded student uploads a file; the commission moves to AWAITING_REVIEW. */
export async function submitDeliverable(session: Session, commissionId: string, form: FormData) {
  const commission = await prisma.commission.findUnique({ where: { id: commissionId } });
  if (!commission) throw new HttpError(404, "Commission not found.");
  if (commission.awardedToId !== session.userId) throw new HttpError(403, "Only the awarded student can submit deliverables.");
  if (commission.status !== "IN_PROGRESS" && commission.status !== "AWAITING_REVIEW") {
    throw new HttpError(400, "Deliverables can only be submitted while work is in progress.");
  }

  const file = form.get("file");
  const message = form.get("message");
  if (!(file instanceof File)) throw new HttpError(400, "No file uploaded.");
  if (file.size > MAX_BYTES) throw new HttpError(400, "Max file size is 20 MB.");
  if (file.type && !ALLOWED_TYPES.includes(file.type)) {
    throw new HttpError(400, "Use a common image, PDF, doc, spreadsheet, or zip file.");
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
  const uploaded = await put(`deliverables/${commission.id}/${Date.now()}-${safeName}`, file, {
    access: "public",
    contentType: file.type || "application/octet-stream",
  });
  const deliverable = await prisma.deliverable.create({
    data: {
      commissionId: commission.id,
      submitterId: session.userId,
      fileUrl: uploaded.url,
      fileName: safeName,
      fileSize: file.size,
      message: message ? String(message).trim() : null,
    },
  });
  if (commission.status === "IN_PROGRESS") {
    await prisma.commission.update({ where: { id: commission.id }, data: { status: "AWAITING_REVIEW" } });
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
export async function decideDeliverable(session: Session, id: string, input: { action?: unknown; notes?: unknown }) {
  const { action, notes } = input;
  if (action !== "APPROVE" && action !== "REQUEST_REVISION") throw new HttpError(400, "Invalid action.");
  if (action === "REQUEST_REVISION" && (!notes || String(notes).trim().length < 5)) {
    throw new HttpError(400, "Please describe what needs to change.");
  }

  const deliverable = await prisma.deliverable.findUnique({
    where: { id },
    include: { commission: { select: { id: true, title: true, commissionerId: true, awardedToId: true, status: true } } },
  });
  if (!deliverable) throw new HttpError(404, "Deliverable not found.");
  if (deliverable.commission.commissionerId !== session.userId) throw new HttpError(403, "Only the commissioner can review deliverables.");
  if (deliverable.status !== "SUBMITTED") throw new HttpError(400, "This deliverable has already been reviewed.");

  const approve = action === "APPROVE";
  await prisma.deliverable.update({
    where: { id },
    data: { status: approve ? "APPROVED" : "REVISION_REQUESTED", reviewerNotes: notes ? String(notes).trim() : null, reviewedAt: new Date() },
  });
  if (!approve && deliverable.commission.status === "AWAITING_REVIEW") {
    await prisma.commission.update({ where: { id: deliverable.commission.id }, data: { status: "IN_PROGRESS" } });
  }
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
