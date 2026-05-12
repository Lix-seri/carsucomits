import { NextResponse } from "next/server";
import { Category, CommissionStatus, SkillLevel } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

const VALID_CATS = Object.values(Category);
const VALID_LEVELS = Object.values(SkillLevel);
const VALID_STATUSES = Object.values(CommissionStatus);

// GET /api/commissions?category=ACADEMIC&level=INTERMEDIATE&q=tutor&status=OPEN
export async function GET(req: Request) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category");
  const level = url.searchParams.get("level");
  const q = url.searchParams.get("q");
  const statusParam = url.searchParams.get("status") ?? "OPEN";
  const status: CommissionStatus = VALID_STATUSES.includes(statusParam as CommissionStatus)
    ? (statusParam as CommissionStatus)
    : CommissionStatus.OPEN;

  const commissions = await prisma.commission.findMany({
    where: {
      status,
      ...(category && VALID_CATS.includes(category as Category) ? { category: category as Category } : {}),
      ...(level && VALID_LEVELS.includes(level as SkillLevel) ? { requiredLevel: level as SkillLevel } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" as const } },
              { description: { contains: q, mode: "insensitive" as const } },
              { subcategory: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      commissioner: { select: { fullName: true, avatarUrl: true } },
      _count: { select: { applications: true } },
    },
    take: 50,
  });
  return NextResponse.json({ ok: true, commissions });
}

// POST /api/commissions — create a new listing
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const body = await req.json();
  const { title, description, category, subcategory, requiredLevel, fareMin, fareMax, fareUnit, deadline } = body;

  if (!title || !description || !category || !requiredLevel || fareMin == null) {
    return NextResponse.json({ error: "Title, description, category, skill level, and fare are required." }, { status: 400 });
  }
  if (!VALID_CATS.includes(category as Category)) {
    return NextResponse.json({ error: "Invalid category." }, { status: 400 });
  }
  if (!VALID_LEVELS.includes(requiredLevel as SkillLevel)) {
    return NextResponse.json({ error: "Invalid skill level." }, { status: 400 });
  }
  if (Number(fareMin) < 0) {
    return NextResponse.json({ error: "Fare must be a positive number." }, { status: 400 });
  }

  const commission = await prisma.commission.create({
    data: {
      title: String(title).trim(),
      description: String(description).trim(),
      category: category as Category,
      subcategory: subcategory ? String(subcategory).trim() : null,
      requiredLevel: requiredLevel as SkillLevel,
      fareMin: Number(fareMin),
      fareMax: fareMax != null ? Number(fareMax) : null,
      fareUnit: fareUnit ? String(fareUnit).trim() : null,
      deadline: deadline ? new Date(deadline) : null,
      commissionerId: session.userId,
      status: CommissionStatus.OPEN,
    },
  });
  return NextResponse.json({ ok: true, commission });
}
