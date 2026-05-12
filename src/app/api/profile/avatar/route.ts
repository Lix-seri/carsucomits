import { NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// POST /api/profile/avatar — uploads to Vercel Blob and updates the user's avatarUrl.
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Use JPG, PNG, WebP, or GIF." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Max file size is 5 MB." }, { status: 400 });
  }

  const ext = file.type === "image/jpeg" ? "jpg"
            : file.type === "image/png"  ? "png"
            : file.type === "image/webp" ? "webp"
            : "gif";
  const key = `avatars/${session.userId}-${Date.now()}.${ext}`;

  // Upload to Vercel Blob (public — anyone with the URL can view, fine for avatars).
  const uploaded = await put(key, file, { access: "public", contentType: file.type });

  // Best-effort: remove the previous avatar from Blob storage.
  const existing = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { avatarUrl: true },
  });
  if (existing?.avatarUrl?.startsWith("https://")) {
    try { await del(existing.avatarUrl); } catch { /* ignore */ }
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: { avatarUrl: uploaded.url },
  });

  return NextResponse.json({ ok: true, url: uploaded.url });
}

export async function DELETE() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const existing = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { avatarUrl: true },
  });
  if (existing?.avatarUrl?.startsWith("https://")) {
    try { await del(existing.avatarUrl); } catch { /* ignore */ }
  }
  await prisma.user.update({
    where: { id: session.userId },
    data: { avatarUrl: null },
  });
  return NextResponse.json({ ok: true });
}
