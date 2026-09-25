import { jsonRoute } from "@/lib/http";
import { requireSession } from "@/lib/session";
import { listThreads } from "@/features/messages/server";

// GET /api/messages/threads — one entry per conversation partner
export const GET = jsonRoute(async () => listThreads(await requireSession()));
