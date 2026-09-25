import { prisma } from "@/lib/db";
import { HttpError } from "@/lib/http";
import type { Session } from "@/lib/session";
import { notify } from "@/features/notifications/server";

/** One entry per person I've talked to, with the latest message and unread count. */
export async function listThreads(session: Session) {
  const messages = await prisma.message.findMany({
    where: { OR: [{ senderId: session.userId }, { recipientId: session.userId }] },
    orderBy: { createdAt: "desc" },
    include: {
      sender: { select: { id: true, fullName: true, avatarUrl: true } },
      recipient: { select: { id: true, fullName: true, avatarUrl: true } },
    },
    take: 200,
  });

  const byOther = new Map<
    string,
    { otherId: string; otherName: string; otherAvatar: string | null; lastBody: string; lastFromMe: boolean; lastAt: string; unread: number }
  >();
  for (const m of messages) {
    const fromMe = m.senderId === session.userId;
    const other = fromMe ? m.recipient : m.sender;
    const existing = byOther.get(other.id);
    if (!existing) {
      byOther.set(other.id, {
        otherId: other.id,
        otherName: other.fullName,
        otherAvatar: other.avatarUrl,
        lastBody: m.body,
        lastFromMe: fromMe,
        lastAt: m.createdAt.toISOString(),
        unread: !fromMe && !m.readAt ? 1 : 0,
      });
    } else if (!fromMe && !m.readAt) {
      existing.unread += 1;
    }
  }
  return { threads: Array.from(byOther.values()) };
}

/** Full conversation with one user; marks their messages to me as read. */
export async function getConversation(session: Session, otherId: string) {
  if (otherId === session.userId) throw new HttpError(400, "You can't message yourself.");
  const other = await prisma.user.findUnique({ where: { id: otherId }, select: { id: true, fullName: true, avatarUrl: true } });
  if (!other) throw new HttpError(404, "User not found.");

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: session.userId, recipientId: otherId },
        { senderId: otherId, recipientId: session.userId },
      ],
    },
    orderBy: { createdAt: "asc" },
    take: 500,
  });
  await prisma.message.updateMany({
    where: { senderId: otherId, recipientId: session.userId, readAt: null },
    data: { readAt: new Date() },
  });
  return { other, messages };
}

export async function sendMessage(session: Session, input: { recipientId?: unknown; body?: unknown; commissionId?: unknown }) {
  const { recipientId, body, commissionId } = input;
  if (typeof recipientId !== "string" || !recipientId || typeof body !== "string" || !body.trim()) {
    throw new HttpError(400, "Recipient and message body are required.");
  }
  if (recipientId === session.userId) throw new HttpError(400, "You can't message yourself.");

  const recipient = await prisma.user.findUnique({ where: { id: recipientId } });
  if (!recipient) throw new HttpError(404, "Recipient not found.");
  if (recipient.status === "BANNED") throw new HttpError(403, "This account is banned.");

  const message = await prisma.message.create({
    data: {
      senderId: session.userId,
      recipientId,
      body: body.trim(),
      commissionId: typeof commissionId === "string" && commissionId ? commissionId : null,
    },
  });
  await notify({
    userId: recipientId,
    type: "APPLICATION_RECEIVED", // re-using the type; a NEW_MESSAGE type can be added later
    title: `New message from ${session.fullName}`,
    body: body.trim().slice(0, 100),
    link: `/messages?with=${session.userId}`,
  });
  return { message };
}
