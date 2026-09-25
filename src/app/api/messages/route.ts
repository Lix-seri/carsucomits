import { jsonRoute, readJson } from "@/lib/http";
import { requireSession } from "@/lib/session";
import { sendMessage } from "@/features/messages/server";
import { sendMessageSchema } from "@/features/messages/schemas";

// POST /api/messages — { recipientId, body, commissionId? }
export const POST = jsonRoute(async (req) => {
  const session = await requireSession();
  return sendMessage(session, sendMessageSchema.parse(await readJson(req)));
});
