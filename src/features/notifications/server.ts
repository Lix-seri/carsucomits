import { prisma } from "@/lib/db";
import type { Session } from "@/lib/session";

export type NotificationType =
  | "APPLICATION_RECEIVED"
  | "APPLICATION_ACCEPTED"
  | "APPLICATION_DECLINED"
  | "COMMISSION_COMPLETED"
  | "RATING_RECEIVED"
  | "ACCOUNT_FLAGGED"
  | "REPORT_RESOLVED"
  | "AGREEMENT";

export async function notify(opts: {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
}) {
  return prisma.notification.create({
    data: {
      userId: opts.userId,
      type: opts.type,
      title: opts.title,
      body: opts.body,
      link: opts.link,
    },
  });
}

export async function listNotifications(session: Session) {
  const [notifications, unread] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.notification.count({ where: { userId: session.userId, readAt: null } }),
  ]);
  return { notifications, unread };
}

/** Marks the caller's unread notifications as read: all of them, or only `ids`. */
export async function markNotificationsRead(session: Session, only: string[] = []) {
  await prisma.notification.updateMany({
    where: { userId: session.userId, readAt: null, ...(only.length > 0 ? { id: { in: only } } : {}) },
    data: { readAt: new Date() },
  });
}
