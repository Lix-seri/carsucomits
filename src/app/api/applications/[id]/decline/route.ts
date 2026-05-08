import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { notify } from "@/lib/notifications";

// POST /api/applications/[id]/decline — REQ-4.3
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { id } = await ctx.params;
  const application = await prisma.application.findUnique({
    where: { id },
    include: { commission: true },
  });
  if (!application) return NextResponse.json({ error: "Application not found." }, { status: 404 });
  if (application.commission.commissionerId !== session.userId) {
    return NextResponse.json({ error: "Only the commissioner who posted this listing can decline." }, { status: 403 });
  }
  if (application.status !== "PENDING") {
    return NextResponse.json({ error: "This application has already been decided." }, { status: 400 });
  }

  await prisma.application.update({ where: { id }, data: { status: "REJECTED" } });

  await notify({
    userId: application.applicantId,
    type: "APPLICATION_DECLINED",
    title: "Application declined",
    body: `Your application for "${application.commission.title}" was declined.`,
    link: `/browse`,
  });

  return NextResponse.json({ ok: true });
}
