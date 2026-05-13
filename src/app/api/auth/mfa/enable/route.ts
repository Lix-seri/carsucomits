import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { verifyTotp, generateBackupCodes } from "@/lib/mfa";

// POST /api/auth/mfa/enable — confirms the user's authenticator app is set up
// by verifying a 6-digit code, then permanently enables MFA + returns backup codes.
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { code } = await req.json();
  if (!code) return NextResponse.json({ error: "Code required." }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user?.totpSecret) {
    return NextResponse.json({ error: "Start MFA setup first." }, { status: 400 });
  }
  if (!verifyTotp(user.totpSecret, String(code))) {
    return NextResponse.json({ error: "Invalid code. Try again." }, { status: 400 });
  }

  const backupCodes = generateBackupCodes(6);
  await prisma.user.update({
    where: { id: user.id },
    data: { mfaEnabled: true, mfaBackupCodes: JSON.stringify(backupCodes) },
  });

  await prisma.auditLog.create({
    data: { actorId: user.id, action: "MFA_ENABLED", target: user.id },
  });

  return NextResponse.json({ ok: true, backupCodes });
}
