import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

// POST /api/auth/mfa/disable — re-verifies the user's password and turns MFA off.
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { password } = await req.json();
  if (!password) return NextResponse.json({ error: "Password required." }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "Incorrect password." }, { status: 401 });

  await prisma.user.update({
    where: { id: user.id },
    data: { mfaEnabled: false, totpSecret: null, mfaBackupCodes: null },
  });

  await prisma.auditLog.create({
    data: { actorId: user.id, action: "MFA_DISABLED", target: user.id },
  });

  return NextResponse.json({ ok: true });
}
