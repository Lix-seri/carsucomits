import { jsonRoute, readJson } from "@/lib/http";
import { requireSession } from "@/lib/session";
import { updateLimits } from "@/features/settings/server";
import { updateSettingsSchema } from "@/features/settings/schemas";

// PUT /api/admin/settings — { MAX_PENDING_APPLICATIONS, MAX_ACTIVE_JOBS }
export const PUT = jsonRoute(async (req) => {
  const session = await requireSession();
  return updateLimits(session, updateSettingsSchema.parse(await readJson(req)));
});
