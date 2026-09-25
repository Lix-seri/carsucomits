import { jsonRoute, readJson } from "@/lib/http";
import { requireSession } from "@/lib/session";
import { fileReport } from "@/features/reports/server";

// POST /api/reports — report another user
export const POST = jsonRoute(async (req) => fileReport(await requireSession(), await readJson(req)));
