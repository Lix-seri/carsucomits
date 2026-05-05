import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { setSession } from "@/lib/session";

export async function POST(req: Request) {
  const { fullName, email, password, role } = await req.json();

  if (!fullName || !email || !password) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }
  if (!email.endsWith("@carsu.edu.ph")) {
    return NextResponse.json({ error: "Use your @carsu.edu.ph email." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  // Self-registration cannot create admins. Admins must be seeded by an existing admin
  // or via `npm run db:seed`.
  const safeRole =
    role === "COMMISSIONER" ? "COMMISSIONER" : "STUDENT_EMPLOYEE";

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { fullName, email, passwordHash, role: safeRole },
  });

  await setSession({
    userId: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role as "STUDENT_EMPLOYEE" | "COMMISSIONER" | "ADMIN",
  });
  return NextResponse.json({ ok: true, user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role } });
}
