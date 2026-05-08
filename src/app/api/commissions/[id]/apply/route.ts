import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { notify } from "@/lib/notifications";

// POST /api/commissions/[id]/apply
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { id: commissionId } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const { coverLetter, proposedRate } = body ?? {};

  const commission = await prisma.commission.findUnique({ where: { id: commissionId } });
  if (!commission) return NextResponse.json({ error: "Commission not found." }, { status: 404 });
  if (commission.status !== "OPEN") {
    return NextResponse.json({ error: "This commission is no longer accepting applications." }, { status: 400 });
  }
  if (commission.commissionerId === session.userId) {
    return NextResponse.json({ error: "You cannot apply to your own commission." }, { status: 400 });
  }

  // REQ-3.4: prevent duplicate applications. The schema's @@unique enforces this too.
  const existing = await prisma.application.findUnique({
    where: { commissionId_applicantId: { commissionId, applicantId: session.userId } },
  });
  if (existing) {
    return NextResponse.json({ error: "You have already applied to this commission." }, { status: 409 });
  }

  const application = await prisma.application.create({
    data: {
      commissionId,
      applicantId: session.userId,
      coverLetter: coverLetter ? String(coverLetter).trim() : null,
      proposedRate: proposedRate != null ? Number(proposedRate) : null,
      status: "PENDING",
    },
  });

  // REQ-3.3: notify the Commissioner.
  await notify({
    userId: commission.commissionerId,
    type: "APPLICATION_RECEIVED",
    title: "New applicant on your commission",
    body: `${session.fullName} applied to "${commission.title}".`,
    link: `/commissioner/applicants?commissionId=${commission.id}`,
  });

  return NextResponse.json({ ok: true, application });
}
