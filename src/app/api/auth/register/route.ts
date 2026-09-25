import { jsonRoute, readJson } from "@/lib/http";
import { register } from "@/features/auth/server";

// POST /api/auth/register — { fullName, email, password }
export const POST = jsonRoute(async (req) => register(await readJson(req)));
