import { NextResponse } from "next/server";
import { jsonRoute, readJson } from "@/lib/http";
import { login } from "@/features/auth/server";
import { loginSchema } from "@/features/auth/schemas";

// POST /api/auth/login — { email, password, expectedRole, mfaCode? }
export const POST = jsonRoute(async (req) => {
  const result = await login(loginSchema.parse(await readJson(req)));
  // The login form reads { ok: false, mfaRequired: true } as "show the code step".
  return "mfaRequired" in result ? NextResponse.json({ ok: false, mfaRequired: true }) : result;
});
