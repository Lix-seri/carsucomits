import { jsonRoute } from "@/lib/http";
import { requireSession } from "@/lib/session";
import { getConversation } from "@/features/messages/server";

// GET /api/messages/[userId] — conversation with that user (marks their messages read)
export const GET = jsonRoute(async (_req, ctx: { params: Promise<{ userId: string }> }) =>
  getConversation(await requireSession(), (await ctx.params).userId),
);
