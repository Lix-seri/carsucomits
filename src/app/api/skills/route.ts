import { jsonRoute, readJson } from "@/lib/http";
import { requireSession } from "@/lib/session";
import { addSkill } from "@/features/profile/server";

// POST /api/skills — { name, level }
export const POST = jsonRoute(async (req) => addSkill(await requireSession(), await readJson(req)));
