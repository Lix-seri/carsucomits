import { NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

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
  const filename = `${session.userId}-${Date.now()}.${ext}`;
  const dir = path.join(process.cwd(), "public", "avatars");
  await mkdir(dir, { recursive: true });
  const dest = path.join(dir, filename);
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(dest, buf);

  // Best-effort: remove the previous avatar file
  const existing = await prisma.user.findUnique({ where: { id: session.userId }, select: { avatarUrl: true } });
  if (existing?.avatarUrl?.startsWith("/avatars/")) {
    try { await unlink(path.join(process.cwd(), "public", existing.avatarUrl)); } catch { /* ignore */ }
  }

  const url = `/avatars/${filename}`;
  await prisma.user.update({ where: { id: session.userId }, data: { avatarUrl: url } });
  return NextResponse.json({ ok: true, url });
}

export async function DELETE() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const existing = await prisma.user.findUnique({ where: { id: session.userId }, select: { avatarUrl: true } });
  if (existing?.avatarUrl?.startsWith("/avatars/")) {
    try { await unlink(path.join(process.cwd(), "public", existing.avatarUrl)); } catch { /* ignore */ }
  }
  await prisma.user.update({ where: { id: session.userId }, data: { avatarUrl: null } });
  return NextResponse.json({ ok: true });
}
