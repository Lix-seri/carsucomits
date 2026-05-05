import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { reporteeEmail, reason, details } = await req.json();
  if (!reporteeEmail || !reason) {
    return NextResponse.json({ error: "Reported user and reason are required." }, { status: 400 });
  }

  const reportee = await prisma.user.findUnique({ where: { email: reporteeEmail.toLowerCase() } });
  if (!reportee) return NextResponse.json({ error: "That user doesn't exist on CarsuComits." }, { status: 404 });
  if (reportee.id === session.userId) return NextResponse.json({ error: "You can't report yourself." }, { status: 400 });

  const report = await prisma.report.create({
    data: {
      reporterId: session.userId,
      reporteeId: reportee.id,
      reason,
      details: details ?? null,
    },
  });
  return NextResponse.json({ ok: true, report });
}
