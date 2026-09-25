import { jsonRoute, readJson } from "@/lib/http";
import { requireSession } from "@/lib/session";
import { disableMfa } from "@/features/auth/server";

// POST /api/auth/mfa/disable — { password }
export const POST = jsonRoute(async (req) => disableMfa(await requireSession(), (await readJson(req)).password));
