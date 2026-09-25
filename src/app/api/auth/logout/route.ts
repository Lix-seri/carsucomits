import { NextResponse } from "next/server";
import { clearSession } from "@/lib/session";

// POST /api/auth/logout. There's no GET: a link or image on any site could otherwise sign users out.
export async function POST() {
  await clearSession();
  return NextResponse.json({ ok: true });
}
