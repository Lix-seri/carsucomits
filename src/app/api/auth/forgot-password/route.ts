import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendPasswordResetEmail, makeToken } from "@/lib/email";

// POST /api/auth/forgot-password — body: { email }
// Always returns ok to avoid leaking which emails are registered.
export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email required." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (user) {
    const token = makeToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt },
    });
    await sendPasswordResetEmail(user.email, token);
  }
  return NextResponse.json({ ok: true });
}
