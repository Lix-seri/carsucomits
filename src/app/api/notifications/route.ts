import { jsonRoute, readJson } from "@/lib/http";
import { getSession, requireSession } from "@/lib/session";
import { listNotifications, markNotificationsRead } from "@/features/notifications/server";

// GET /api/notifications — mine (empty when signed out, so the bell can poll freely)
export const GET = jsonRoute(async () => {
  const session = await getSession();
  return session ? listNotifications(session) : { notifications: [], unread: 0 };
});

// PATCH /api/notifications — mark all read, or only body.ids
export const PATCH = jsonRoute(async (req) => {
  await markNotificationsRead(await requireSession(), (await readJson(req)).ids);
  return {};
});
