import { jsonRoute, readJson } from "@/lib/http";
import { requireSession } from "@/lib/session";
import { enableMfa } from "@/features/auth/server";
import { mfaCodeSchema } from "@/features/auth/schemas";

// POST /api/auth/mfa/enable — { code } → backup codes
export const POST = jsonRoute(async (req) => {
  const session = await requireSession();
  return enableMfa(session, mfaCodeSchema.parse(await readJson(req)).code);
});
