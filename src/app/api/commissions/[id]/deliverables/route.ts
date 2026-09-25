import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { notify } from "@/features/notifications/server";

const MAX_BYTES = 20 * 1024 * 1024; // 20 MB
const ALLOWED_TYPES = [
  "image/jpeg", "image/png", "image/webp", "image/gif",
  "application/pdf",
  "application/zip", "application/x-zip-compressed",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain", "text/csv",
];

// POST /api/commissions/[id]/deliverables — awarded student uploads a deliverable file
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { id } = await ctx.params;
  const commission = await prisma.commission.findUnique({ where: { id } });
  if (!commission) return NextResponse.json({ error: "Commission not found." }, { status: 404 });
  if (commission.awardedToId !== session.userId) {
    return NextResponse.json({ error: "Only the awarded student can submit deliverables." }, { status: 403 });
  }
  if (commission.status !== "IN_PROGRESS" && commission.status !== "AWAITING_REVIEW") {
    return NextResponse.json({ error: "Deliverables can only be submitted while work is in progress." }, { status: 400 });
  }

  const form = await req.formData();
  const file = form.get("file");
  const message = form.get("message");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Max file size is 20 MB." }, { status: 400 });
  if (file.type && !ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Use a common image, PDF, doc, spreadsheet, or zip file." }, { status: 400 });
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
  const key = `deliverables/${commission.id}/${Date.now()}-${safeName}`;
  const uploaded = await put(key, file, { access: "public", contentType: file.type || "application/octet-stream" });

  const created = await prisma.deliverable.create({
    data: {
      commissionId: commission.id,
      submitterId: session.userId,
      fileUrl: uploaded.url,
      fileName: safeName,
      fileSize: file.size,
      message: message ? String(message).trim() : null,
    },
  });

  // Move commission into "awaiting review" state.
  if (commission.status === "IN_PROGRESS") {
    await prisma.commission.update({ where: { id: commission.id }, data: { status: "AWAITING_REVIEW" } });
  }

  await notify({
    userId: commission.commissionerId,
    type: "APPLICATION_RECEIVED",
    title: "New deliverable submitted",
    body: `${session.fullName} submitted "${safeName}" for "${commission.title}".`,
    link: `/commission/${commission.id}`,
  });

  return NextResponse.json({ ok: true, deliverable: created });
}
