import { NextResponse } from "next/server";
import { ReportStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

const ACTION_TO_STATUS: Record<string, ReportStatus> = {
  RESOLVE: ReportStatus.RESOLVED,
  ESCALATE: ReportStatus.ESCALATED,
  REOPEN: ReportStatus.PENDING,
};

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Admins only." }, { status: 403 });

  const { id } = await ctx.params;
  const { action } = await req.json();
  const status = ACTION_TO_STATUS[action as keyof typeof ACTION_TO_STATUS];
  if (!status) return NextResponse.json({ error: "Invalid action." }, { status: 400 });

  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) return NextResponse.json({ error: "Report not found." }, { status: 404 });

  await prisma.report.update({
    where: { id },
    data: {
      status,
      resolvedById: status === ReportStatus.PENDING ? null : session.userId,
      resolvedAt: status === ReportStatus.PENDING ? null : new Date(),
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: `REPORT_${action}`,
      target: id,
      meta: JSON.stringify({ reportId: id, newStatus: status }),
    },
  });

  return NextResponse.json({ ok: true, status });
}
