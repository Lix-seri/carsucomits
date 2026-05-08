import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { notify } from "@/lib/notifications";

// POST /api/messages — send a message
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { recipientId, body, commissionId } = await req.json();
  if (!recipientId || !body || typeof body !== "string" || !body.trim()) {
    return NextResponse.json({ error: "Recipient and message body are required." }, { status: 400 });
  }
  if (recipientId === session.userId) {
    return NextResponse.json({ error: "You can't message yourself." }, { status: 400 });
  }

  const recipient = await prisma.user.findUnique({ where: { id: recipientId } });
  if (!recipient) return NextResponse.json({ error: "Recipient not found." }, { status: 404 });
  if (recipient.status === "BANNED") {
    return NextResponse.json({ error: "This account is banned." }, { status: 403 });
  }

  const message = await prisma.message.create({
    data: {
      senderId: session.userId,
      recipientId,
      body: body.trim(),
      commissionId: commissionId || null,
    },
  });

  // In-platform notification for the recipient.
  await notify({
    userId: recipientId,
    type: "APPLICATION_RECEIVED", // re-using the type; a NEW_MESSAGE type can be added later
    title: `New message from ${session.fullName}`,
    body: body.trim().slice(0, 100),
    link: `/messages?with=${session.userId}`,
  });

  return NextResponse.json({ ok: true, message });
}
