import { jsonRoute } from "@/lib/http";
import { requireSession } from "@/lib/session";
import { startMfaSetup } from "@/features/auth/server";

// POST /api/auth/mfa/setup — new TOTP secret + QR code
export const POST = jsonRoute(async () => startMfaSetup(await requireSession()));
