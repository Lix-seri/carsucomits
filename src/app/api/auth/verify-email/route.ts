import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST /api/auth/verify-email — body: { token }
export async function POST(req: Request) {
  const { token } = await req.json();
  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "Missing token." }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { emailVerificationToken: token } });
  if (!user) {
    return NextResponse.json({ error: "Invalid or expired verification link." }, { status: 400 });
  }
  if (user.emailVerified) {
    return NextResponse.json({ ok: true, alreadyVerified: true });
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, emailVerifiedAt: new Date(), emailVerificationToken: null },
  });
  return NextResponse.json({ ok: true });
}
