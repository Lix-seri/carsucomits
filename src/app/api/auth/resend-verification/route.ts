import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { sendVerificationEmail, makeToken } from "@/lib/email";

// POST /api/auth/resend-verification — re-issues the verification email for the
// currently signed-in user (or by email if provided in body).
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const session = await getSession();
  const email: string | undefined = body?.email ?? session?.email;

  if (!email) return NextResponse.json({ error: "Email required." }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });
  // Don't disclose whether the email exists.
  if (!user || user.emailVerified) {
    return NextResponse.json({ ok: true });
  }

  const token = makeToken();
  await prisma.user.update({ where: { id: user.id }, data: { emailVerificationToken: token } });
  await sendVerificationEmail(user.email, token);
  return NextResponse.json({ ok: true });
}
