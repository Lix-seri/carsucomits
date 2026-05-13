import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

// POST /api/saved/[commissionId] — toggles bookmark on/off
export async function POST(_req: Request, ctx: { params: Promise<{ commissionId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { commissionId } = await ctx.params;

  const commission = await prisma.commission.findUnique({ where: { id: commissionId } });
  if (!commission) return NextResponse.json({ error: "Commission not found." }, { status: 404 });

  const existing = await prisma.savedCommission.findUnique({
    where: { userId_commissionId: { userId: session.userId, commissionId } },
  });
  if (existing) {
    await prisma.savedCommission.delete({ where: { id: existing.id } });
    return NextResponse.json({ ok: true, saved: false });
  }
  await prisma.savedCommission.create({
    data: { userId: session.userId, commissionId },
  });
  return NextResponse.json({ ok: true, saved: true });
}
