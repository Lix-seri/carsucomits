import { jsonRoute, readJson } from "@/lib/http";
import { requireSession } from "@/lib/session";
import { fileReport } from "@/features/reports/server";
import { fileReportSchema } from "@/features/reports/schemas";

// POST /api/reports — { reporteeEmail, reason, details }
export const POST = jsonRoute(async (req) => {
  const session = await requireSession();
  return fileReport(session, fileReportSchema.parse(await readJson(req)));
});
