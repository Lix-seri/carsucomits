import { prisma } from "./db";

export type NotificationType =
  | "APPLICATION_RECEIVED"
  | "APPLICATION_ACCEPTED"
  | "APPLICATION_DECLINED"
  | "COMMISSION_COMPLETED"
  | "RATING_RECEIVED"
  | "ACCOUNT_FLAGGED"
  | "REPORT_RESOLVED";

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
