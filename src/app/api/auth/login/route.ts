import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { setSession } from "@/lib/session";

export async function POST(req: Request) {
  const { email, password, expectedRole } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  if (user.status === "BANNED") return NextResponse.json({ error: "This account is banned." }, { status: 403 });
  if (user.status === "SUSPENDED") return NextResponse.json({ error: "This account is suspended." }, { status: 403 });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });

  // Enforce the role chosen on the login screen.
  if (expectedRole === "ADMIN" && user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "This is not an admin account. Switch to the Student tab to sign in." },
      { status: 403 }
    );
  }
  if (expectedRole === "STUDENT" && user.role === "ADMIN") {
    return NextResponse.json(
      { error: "This is an admin account. Switch to the Admin tab to sign in." },
      { status: 403 }
    );
  }

  await setSession({
    userId: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role as "STUDENT_EMPLOYEE" | "COMMISSIONER" | "ADMIN",
  });
  return NextResponse.json({ ok: true, user: { id: user.id, fullName: user.fullName, role: user.role } });
}
