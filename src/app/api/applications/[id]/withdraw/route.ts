import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { notify } from "@/features/notifications/server";

// POST /api/applications/[id]/withdraw — applicant cancels their own application
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { id } = await ctx.params;

  const application = await prisma.application.findUnique({
    where: { id },
    include: { commission: { select: { id: true, title: true, commissionerId: true, status: true } } },
  });
  if (!application) return NextResponse.json({ error: "Application not found." }, { status: 404 });
  if (application.applicantId !== session.userId) {
    return NextResponse.json({ error: "You can only withdraw your own application." }, { status: 403 });
  }
  if (application.status !== "PENDING") {
    return NextResponse.json({ error: "Only pending applications can be withdrawn." }, { status: 400 });
  }
  if (application.commission.status !== "OPEN") {
    return NextResponse.json({ error: "This commission is no longer accepting changes." }, { status: 400 });
  }

  await prisma.application.update({ where: { id }, data: { status: "WITHDRAWN" } });

  // Quietly let the commissioner know.
  await notify({
    userId: application.commission.commissionerId,
    type: "APPLICATION_DECLINED",
    title: "An applicant withdrew",
    body: `${session.fullName} withdrew their application for "${application.commission.title}".`,
    link: `/commissioner/applicants?commissionId=${application.commission.id}`,
  });

  return NextResponse.json({ ok: true });
}
