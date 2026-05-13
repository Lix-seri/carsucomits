import { NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { id } = await ctx.params;

  const commission = await prisma.commission.findUnique({ where: { id } });
  if (!commission) return NextResponse.json({ error: "Commission not found." }, { status: 404 });
  if (commission.commissionerId !== session.userId) {
    return NextResponse.json({ error: "Only the owner can change the cover image." }, { status: 403 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: "Use JPG, PNG, or WebP." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Max file size is 5 MB." }, { status: 400 });

  const ext = file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : "webp";
  const key = `commissions/${commission.id}-${Date.now()}.${ext}`;
  const uploaded = await put(key, file, { access: "public", contentType: file.type });

  if (commission.coverImageUrl?.startsWith("https://")) {
    try { await del(commission.coverImageUrl); } catch { /* ignore */ }
  }

  await prisma.commission.update({ where: { id }, data: { coverImageUrl: uploaded.url } });
  return NextResponse.json({ ok: true, url: uploaded.url });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { id } = await ctx.params;

  const commission = await prisma.commission.findUnique({ where: { id } });
  if (!commission) return NextResponse.json({ error: "Commission not found." }, { status: 404 });
  if (commission.commissionerId !== session.userId) {
    return NextResponse.json({ error: "Only the owner can remove the cover image." }, { status: 403 });
  }

  if (commission.coverImageUrl?.startsWith("https://")) {
    try { await del(commission.coverImageUrl); } catch { /* ignore */ }
  }
  await prisma.commission.update({ where: { id }, data: { coverImageUrl: null } });
  return NextResponse.json({ ok: true });
}
