import { jsonRoute, readJson } from "@/lib/http";
import { requireSession } from "@/lib/session";
import { addSkill } from "@/features/profile/server";
import { skillSchema } from "@/features/profile/schemas";

// POST /api/skills — { name, level }
export const POST = jsonRoute(async (req) => {
  const session = await requireSession();
  return addSkill(session, skillSchema.parse(await readJson(req)));
});
