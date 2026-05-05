import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { id } = await ctx.params;
  const skill = await prisma.skill.findUnique({ where: { id } });
  if (!skill || skill.userId !== session.userId) {
    return NextResponse.json({ error: "Skill not found." }, { status: 404 });
  }
  await prisma.skill.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
