import { jsonRoute, readJson } from "@/lib/http";
import { requireSession } from "@/lib/session";
import { createCommission, listCommissions } from "@/features/commissions/server";

// GET /api/commissions?category=ACADEMIC&level=INTERMEDIATE&q=tutor&status=OPEN
export const GET = jsonRoute(async (req) => listCommissions(new URL(req.url).searchParams));

// POST /api/commissions — create a listing
export const POST = jsonRoute(async (req) => createCommission(await requireSession(), await readJson(req)));
