import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

// GET /api/messages/threads — returns one entry per other user I've talked to,
// with the latest message and unread count.
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, threads: [] }, { status: 401 });

  const messages = await prisma.message.findMany({
    where: {
      OR: [{ senderId: session.userId }, { recipientId: session.userId }],
    },
    orderBy: { createdAt: "desc" },
    include: {
      sender: { select: { id: true, fullName: true, avatarUrl: true } },
      recipient: { select: { id: true, fullName: true, avatarUrl: true } },
    },
    take: 200,
  });

  const byOther = new Map<
    string,
    {
      otherId: string;
      otherName: string;
      otherAvatar: string | null;
      lastBody: string;
      lastFromMe: boolean;
      lastAt: string;
      unread: number;
    }
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

  return NextResponse.json({ ok: true, threads: Array.from(byOther.values()) });
}
