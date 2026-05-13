import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, items: [] }, { status: 401 });

  const saved = await prisma.savedCommission.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    include: {
      commission: {
        include: {
          commissioner: { select: { fullName: true, avatarUrl: true } },
          _count: { select: { applications: true } },
        },
      },
    },
  });
  return NextResponse.json({ ok: true, items: saved });
}
