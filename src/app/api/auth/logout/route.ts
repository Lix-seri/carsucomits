import { NextResponse } from "next/server";
import { clearSession } from "@/lib/session";

export async function POST() {
  await clearSession();
  return NextResponse.json({ ok: true });
}

// Allow GET so users who navigate directly to /api/auth/logout get a clean redirect.
export async function GET(req: Request) {
  await clearSession();
  return NextResponse.redirect(new URL("/login", req.url));
}
