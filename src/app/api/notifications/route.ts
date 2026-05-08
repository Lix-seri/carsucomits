import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

// GET /api/notifications — list mine
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: true, notifications: [], unread: 0 });

  const [notifications, unread] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.notification.count({ where: { userId: session.userId, readAt: null } }),
  ]);
  return NextResponse.json({ ok: true, notifications, unread });
}

// PATCH /api/notifications  — mark all as read (or specific ids via body)
export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const ids: string[] | undefined = body?.ids;

  await prisma.notification.updateMany({
    where: {
      userId: session.userId,
      readAt: null,
      ...(ids && ids.length > 0 ? { id: { in: ids } } : {}),
    },
    data: { readAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}
