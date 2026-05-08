import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { notify } from "@/lib/notifications";

// POST /api/applications/[id]/accept — REQ-4.2
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { id } = await ctx.params;
  const application = await prisma.application.findUnique({
    where: { id },
    include: { commission: true, applicant: { select: { fullName: true } } },
  });
  if (!application) return NextResponse.json({ error: "Application not found." }, { status: 404 });
  if (application.commission.commissionerId !== session.userId) {
    return NextResponse.json({ error: "Only the commissioner who posted this listing can accept." }, { status: 403 });
  }
  if (application.status !== "PENDING") {
    return NextResponse.json({ error: "This application has already been decided." }, { status: 400 });
  }
  if (application.commission.status !== "OPEN") {
    return NextResponse.json({ error: "This commission has already been awarded." }, { status: 400 });
  }

  // Run as a transaction: accept this applicant, mark others rejected, move commission to IN_PROGRESS.
  await prisma.$transaction([
    prisma.application.update({
      where: { id },
      data: { status: "ACCEPTED" },
    }),
    prisma.application.updateMany({
      where: { commissionId: application.commissionId, NOT: { id }, status: "PENDING" },
      data: { status: "REJECTED" },
    }),
    prisma.commission.update({
      where: { id: application.commissionId },
      data: { status: "IN_PROGRESS", awardedToId: application.applicantId },
    }),
  ]);

  // Notify accepted applicant.
  await notify({
    userId: application.applicantId,
    type: "APPLICATION_ACCEPTED",
    title: "Your application was accepted!",
    body: `You're awarded "${application.commission.title}". Time to get to work.`,
    link: `/hub`,
  });

  // Notify the rejected applicants (if any).
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
      })
    )
  );

  return NextResponse.json({ ok: true });
}
