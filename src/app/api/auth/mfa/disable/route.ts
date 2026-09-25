import { jsonRoute, readJson } from "@/lib/http";
import { requireSession } from "@/lib/session";
import { disableMfa } from "@/features/auth/server";
import { passwordSchema } from "@/features/auth/schemas";

// POST /api/auth/mfa/disable — { password }
export const POST = jsonRoute(async (req) => {
  const session = await requireSession();
  return disableMfa(session, passwordSchema.parse(await readJson(req)).password);
});
