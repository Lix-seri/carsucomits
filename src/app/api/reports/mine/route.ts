import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, filed: [], aboutMe: [] });

  const [filed, aboutMe] = await Promise.all([
    prisma.report.findMany({
      where: { reporterId: session.userId },
      orderBy: { createdAt: "desc" },
      include: { reportee: { select: { fullName: true } }, reporter: { select: { fullName: true } } },
    }),
    prisma.report.findMany({
      where: { reporteeId: session.userId },
      orderBy: { createdAt: "desc" },
      include: { reportee: { select: { fullName: true } }, reporter: { select: { fullName: true } } },
    }),
  ]);

  return NextResponse.json({ ok: true, filed, aboutMe });
}
