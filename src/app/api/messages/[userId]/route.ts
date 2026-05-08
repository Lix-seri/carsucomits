import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

// GET /api/messages/[userId] — full conversation with that user. Marks any
// messages they sent me as read.
export async function GET(_req: Request, ctx: { params: Promise<{ userId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, messages: [] }, { status: 401 });

  const { userId: otherId } = await ctx.params;
  if (otherId === session.userId) {
    return NextResponse.json({ error: "You can't message yourself." }, { status: 400 });
  }

  const other = await prisma.user.findUnique({
    where: { id: otherId },
    select: { id: true, fullName: true, avatarUrl: true },
  });
  if (!other) return NextResponse.json({ error: "User not found." }, { status: 404 });

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

  // Mark unread messages from the other party as read.
  await prisma.message.updateMany({
    where: { senderId: otherId, recipientId: session.userId, readAt: null },
    data: { readAt: new Date() },
  });

  return NextResponse.json({ ok: true, other, messages });
}
