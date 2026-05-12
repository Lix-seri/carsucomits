import { NextResponse } from "next/server";
import { AccountStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

const ACTION_TO_STATUS: Record<string, AccountStatus> = {
  WARN: AccountStatus.WARNED,
  SUSPEND: AccountStatus.SUSPENDED,
  BAN: AccountStatus.BANNED,
  REINSTATE: AccountStatus.ACTIVE,
};

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Admins only." }, { status: 403 });

  const { id } = await ctx.params;
  const { action } = await req.json();
  const status = ACTION_TO_STATUS[action as keyof typeof ACTION_TO_STATUS];
  if (!status) return NextResponse.json({ error: "Invalid action." }, { status: 400 });

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });
  if (target.id === session.userId) {
    return NextResponse.json({ error: "You can't moderate your own account." }, { status: 400 });
  }
  if (target.role === "ADMIN" && action === "BAN") {
    return NextResponse.json({ error: "Admin accounts cannot be banned via this action." }, { status: 400 });
  }

  await prisma.user.update({ where: { id }, data: { status } });
  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action,
      target: id,
      meta: JSON.stringify({ targetEmail: target.email, newStatus: status }),
    },
  });

  return NextResponse.json({ ok: true, status });
}
