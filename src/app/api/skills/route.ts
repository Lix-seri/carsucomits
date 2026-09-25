import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { SkillLevel } from "@prisma/client";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { name, level } = await req.json();
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return NextResponse.json({ error: "Skill name is required (min 2 chars)." }, { status: 400 });
  }
  if (!Object.values(SkillLevel).includes(level)) {
    return NextResponse.json({ error: "Invalid skill level." }, { status: 400 });
  }

  const skill = await prisma.skill.create({
    data: { userId: session.userId, name: name.trim(), level: level as SkillLevel },
  });
  return NextResponse.json({ ok: true, skill });
}
