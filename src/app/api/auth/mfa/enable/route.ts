import { jsonRoute, readJson } from "@/lib/http";
import { requireSession } from "@/lib/session";
import { enableMfa } from "@/features/auth/server";

// POST /api/auth/mfa/enable — { code } → backup codes
export const POST = jsonRoute(async (req) => enableMfa(await requireSession(), (await readJson(req)).code));
