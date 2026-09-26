import { prisma } from "@/lib/db";
import { audit } from "@/lib/audit";
import { HttpError } from "@/lib/http";
import { UNFINISHED_STATUSES } from "@/lib/labels";
import { assertStaff, type Session } from "@/lib/session";
import { notify } from "@/features/notifications/server";
import type { z } from "zod";
import type { decideVerificationSchema, sellerActionSchema, submitVerificationSchema } from "./schemas";

// CCIS verification and seller oversight (decision 0012). Students submit; admins and USED officers decide.

const WITHOUT_PROOF = { id: true, studentIdNumber: true, proofName: true, proofType: true, status: true, reviewNote: true, reviewedAt: true, createdAt: true } as const;

/** Is this student allowed to take on commissions? */
export async function isVerified(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { verifiedAt: true } });
  return !!user?.verifiedAt;
}

export const NOT_VERIFIED = "Only verified CCIS students can take on commissions. Verify your student ID first (Account → Verification).";

/** The student's own verification state: latest request and whether they're verified. */
export async function getMyVerification(session: Session) {
  const [user, latest] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: session.userId }, select: { verifiedAt: true } }),
    prisma.studentVerification.findFirst({ where: { userId: session.userId }, orderBy: { createdAt: "desc" }, select: WITHOUT_PROOF }),
  ]);
  return { verifiedAt: user.verifiedAt, latest };
}

export async function submitVerification(session: Session, input: z.infer<typeof submitVerificationSchema>) {
  // Decision 0003: the institutional domain is checked again here.
  if (!session.email.toLowerCase().endsWith("@carsu.edu.ph")) throw new HttpError(403, "Verification needs an @carsu.edu.ph account.");
  if (session.verified) throw new HttpError(409, "You're already verified.");
  const pending = await prisma.studentVerification.findFirst({ where: { userId: session.userId, status: "PENDING" } });
  if (pending) throw new HttpError(409, "Your request is already waiting for review.");

  const { proof, studentIdNumber } = input;
  const request = await prisma.studentVerification.create({
    data: {
      userId: session.userId,
      studentIdNumber,
      proof: Buffer.from(await proof.arrayBuffer()),
      proofType: proof.type,
      proofName: proof.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100),
    },
    select: WITHOUT_PROOF,
  });
  await audit({ actorId: session.userId, action: "VERIFICATION_SUBMITTED", target: session.userId, after: { status: "PENDING", studentIdNumber } });
  return { request };
}

/** Staff queue, oldest pending first. */
export async function listVerifications(session: Session, status: "PENDING" | "APPROVED" | "REJECTED" | "REVOKED" = "PENDING") {
  assertStaff(session);
  const requests = await prisma.studentVerification.findMany({
    where: { status },
    orderBy: { createdAt: status === "PENDING" ? "asc" : "desc" },
    take: 100,
    select: { ...WITHOUT_PROOF, user: { select: { id: true, fullName: true, email: true } } },
  });
  return { requests };
}

/** Staff only: the proof file. Never public (decision 0012). */
export async function getProof(session: Session, id: string) {
  assertStaff(session);
  const v = await prisma.studentVerification.findUnique({ where: { id }, select: { proof: true, proofType: true, proofName: true } });
  if (!v) throw new HttpError(404, "Verification request not found.");
  return v;
}

export async function decideVerification(session: Session, id: string, { decision, note }: z.infer<typeof decideVerificationSchema>) {
  assertStaff(session);
  const request = await prisma.studentVerification.findUnique({ where: { id } });
  if (!request) throw new HttpError(404, "Verification request not found.");
  if (request.status !== "PENDING") throw new HttpError(400, "This request has already been decided.");
  if (decision === "REJECT" && !note) throw new HttpError(400, "Tell the student why, so they can fix it and resubmit.");

  const approve = decision === "APPROVE";
  const status = approve ? "APPROVED" : "REJECTED";
  await prisma.$transaction([
    prisma.studentVerification.update({ where: { id }, data: { status, reviewNote: note, reviewerId: session.userId, reviewedAt: new Date() } }),
    ...(approve ? [prisma.user.update({ where: { id: request.userId }, data: { verifiedAt: new Date() } })] : []),
    audit({ actorId: session.userId, action: approve ? "VERIFICATION_APPROVED" : "VERIFICATION_REJECTED", target: request.userId, before: { status: "PENDING" }, after: { status }, meta: { requestId: id, note } }),
  ]);
  await notify({
    userId: request.userId,
    type: "ACCOUNT_FLAGGED",
    title: approve ? "You're verified as a CCIS student" : "Your verification was not approved",
    body: approve ? "You can now apply to commissions." : note,
    link: approve ? "/browse" : "/verify",
  });
  return { status };
}

/** Verified students (and suspended sellers) with their work so far, for USED oversight. */
export async function listSellers(session: Session, search = "") {
  assertStaff(session);
  const contains = { contains: search, mode: "insensitive" as const };
  const sellers = await prisma.user.findMany({
    where: {
      verifications: { some: { status: { in: ["APPROVED", "REVOKED"] } } },
      ...(search ? { OR: [{ fullName: contains }, { email: contains }] } : {}),
    },
    orderBy: { fullName: "asc" },
    take: 200,
    select: { id: true, fullName: true, email: true, verifiedAt: true, status: true },
  });
  const ids = sellers.map((s) => s.id);
  const work = await prisma.commission.groupBy({
    by: ["awardedToId", "status"],
    where: { awardedToId: { in: ids } },
    _count: true,
    _sum: { fareMin: true },
  });
  const summary = (id: string) => {
    const rows = work.filter((w) => w.awardedToId === id);
    const done = rows.find((r) => r.status === "COMPLETED");
    return {
      completed: done?._count ?? 0,
      active: rows.filter((r) => (UNFINISHED_STATUSES as readonly string[]).includes(r.status)).reduce((n, r) => n + r._count, 0),
      // ponytail: totals use each commission's minimum fare; agreed ranges aren't split further.
      earnedFrom: done?._sum.fareMin ?? 0,
    };
  };
  return { sellers: sellers.map((s) => ({ ...s, ...summary(s.id) })) };
}

/** USED/admin: suspend a seller (revoke verification) or reinstate one. The account itself stays active. */
export async function setSellerStatus(session: Session, userId: string, { action, reason }: z.infer<typeof sellerActionSchema>) {
  assertStaff(session);
  const latest = await prisma.studentVerification.findFirst({
    where: { userId, status: { in: ["APPROVED", "REVOKED"] } },
    orderBy: { createdAt: "desc" },
  });
  if (!latest) throw new HttpError(404, "This student isn't a registered seller.");
  const suspend = action === "SUSPEND";
  if (suspend && latest.status !== "APPROVED") throw new HttpError(400, "This seller is already suspended.");
  if (!suspend && latest.status !== "REVOKED") throw new HttpError(400, "This seller isn't suspended.");

  const to = suspend ? "REVOKED" : "APPROVED";
  await prisma.$transaction([
    prisma.studentVerification.update({ where: { id: latest.id }, data: { status: to, reviewerId: session.userId, reviewedAt: new Date(), reviewNote: reason } }),
    prisma.user.update({ where: { id: userId }, data: { verifiedAt: suspend ? null : new Date() } }),
    audit({ actorId: session.userId, action: suspend ? "SELLER_SUSPENDED" : "SELLER_REINSTATED", target: userId, before: { seller: latest.status }, after: { seller: to }, meta: { reason } }),
  ]);
  await notify({
    userId,
    type: "ACCOUNT_FLAGGED",
    title: suspend ? "You can't take on new commissions for now" : "You can take on commissions again",
    body: reason,
  });
  return { status: to };
}
