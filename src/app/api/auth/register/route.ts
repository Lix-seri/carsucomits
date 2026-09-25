import { jsonRoute, readJson } from "@/lib/http";
import { register } from "@/features/auth/server";
import { registerSchema } from "@/features/auth/schemas";

// POST /api/auth/register — { fullName, email, password }
export const POST = jsonRoute(async (req) => register(registerSchema.parse(await readJson(req))));
