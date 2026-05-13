import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { notify } from "@/lib/notifications";

// POST /api/deliverables/[id]/decision — body: { action: "APPROVE" | "REQUEST_REVISION", notes?: string }
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { id } = await ctx.params;
  const { action, notes } = await req.json();
  if (action !== "APPROVE" && action !== "REQUEST_REVISION") {
    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  }
  if (action === "REQUEST_REVISION" && (!notes || String(notes).trim().length < 5)) {
    return NextResponse.json({ error: "Please describe what needs to change." }, { status: 400 });
  }

  const deliverable = await prisma.deliverable.findUnique({
    where: { id },
    include: { commission: { select: { id: true, title: true, commissionerId: true, awardedToId: true, status: true } } },
  });
  if (!deliverable) return NextResponse.json({ error: "Deliverable not found." }, { status: 404 });
  if (deliverable.commission.commissionerId !== session.userId) {
    return NextResponse.json({ error: "Only the commissioner can review deliverables." }, { status: 403 });
  }
  if (deliverable.status !== "SUBMITTED") {
    return NextResponse.json({ error: "This deliverable has already been reviewed." }, { status: 400 });
  }

  const newStatus = action === "APPROVE" ? "APPROVED" : "REVISION_REQUESTED";

  await prisma.deliverable.update({
    where: { id },
    data: {
      status: newStatus,
      reviewerNotes: notes ? String(notes).trim() : null,
      reviewedAt: new Date(),
    },
  });

  // If revision requested, bump commission back to IN_PROGRESS so student can resubmit.
  if (action === "REQUEST_REVISION" && deliverable.commission.status === "AWAITING_REVIEW") {
    await prisma.commission.update({
      where: { id: deliverable.commission.id },
      data: { status: "IN_PROGRESS" },
    });
  }

  if (deliverable.commission.awardedToId) {
    await notify({
      userId: deliverable.commission.awardedToId,
      type: action === "APPROVE" ? "COMMISSION_COMPLETED" : "APPLICATION_DECLINED",
      title: action === "APPROVE" ? "Deliverable approved" : "Revision requested",
      body:
        action === "APPROVE"
          ? `Your deliverable for "${deliverable.commission.title}" was approved.`
          : `The commissioner asked for changes on "${deliverable.commission.title}".`,
      link: `/commission/${deliverable.commission.id}`,
    });
  }

  return NextResponse.json({ ok: true });
}
