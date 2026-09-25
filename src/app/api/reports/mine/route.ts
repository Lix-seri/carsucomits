import { jsonRoute } from "@/lib/http";
import { requireSession } from "@/lib/session";
import { listMyReports } from "@/features/reports/server";

// GET /api/reports/mine — reports I filed + reports about me
export const GET = jsonRoute(async () => listMyReports(await requireSession()));
