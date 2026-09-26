import { ReportStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { audit } from "@/lib/audit";
import { HttpError } from "@/lib/http";
import { assertAdmin, type Session } from "@/lib/session";
import type { z } from "zod";
import type { fileReportSchema, reportCommissionSchema } from "./schemas";

export async function fileReport(session: Session, { reporteeEmail, reason, details }: z.infer<typeof fileReportSchema>) {
  const reportee = await prisma.user.findFirst({ where: { email: { equals: reporteeEmail, mode: "insensitive" } } });
  if (!reportee) throw new HttpError(404, "That user doesn't exist on CarSUComits.");
  if (reportee.id === session.userId) throw new HttpError(400, "You can't report yourself.");

  const report = await prisma.report.create({
    data: {
      reporterId: session.userId,
      reporteeId: reportee.id,
      reason,
      details,
    },
  });
  return { report };
}

/** Item 9: report a commission (for example, one asking for graded academic work). Its poster is the reportee. */
export async function reportCommission(session: Session, commissionId: string, { reason, details }: z.infer<typeof reportCommissionSchema>) {
  const commission = await prisma.commission.findUnique({ where: { id: commissionId }, select: { commissionerId: true } });
  if (!commission) throw new HttpError(404, "Commission not found.");
  if (commission.commissionerId === session.userId) throw new HttpError(400, "You can't report your own commission.");
  const report = await prisma.report.create({
    data: { reporterId: session.userId, reporteeId: commission.commissionerId, commissionId, reason, details },
  });
  return { report };
}

/** Reports I filed, and reports about me without the reporter (so reports can't invite retaliation). */
export async function listMyReports(session: Session) {
  const [filed, aboutMe] = await Promise.all([
    prisma.report.findMany({
      where: { reporterId: session.userId },
      orderBy: { createdAt: "desc" },
      include: { reportee: { select: { fullName: true } } },
    }),
    prisma.report.findMany({
      where: { reporteeId: session.userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, reason: true, details: true, status: true, createdAt: true },
    }),
  ]);
  return { filed, aboutMe };
}

const REPORT_ACTIONS = {
  RESOLVE: ReportStatus.RESOLVED,
  ESCALATE: ReportStatus.ESCALATED,
  REOPEN: ReportStatus.PENDING,
} as const;

/** Admin: resolve, escalate or reopen a report. */
export async function actOnReport(session: Session, reportId: string, action: keyof typeof REPORT_ACTIONS) {
  assertAdmin(session);
  const status = REPORT_ACTIONS[action];

  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) throw new HttpError(404, "Report not found.");

  const reopening = status === ReportStatus.PENDING;
  await prisma.$transaction([
    prisma.report.update({
      where: { id: reportId },
      data: { status, resolvedById: reopening ? null : session.userId, resolvedAt: reopening ? null : new Date() },
    }),
    audit({ actorId: session.userId, action: `REPORT_${action}`, target: report.reporteeId, before: { status: report.status }, after: { status }, meta: { reportId } }),
  ]);
  return { status };
}
