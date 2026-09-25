import { jsonRoute, readJson } from "@/lib/http";
import { requireSession } from "@/lib/session";
import { sendMessage } from "@/features/messages/server";

// POST /api/messages — send a message
export const POST = jsonRoute(async (req) => sendMessage(await requireSession(), await readJson(req)));
