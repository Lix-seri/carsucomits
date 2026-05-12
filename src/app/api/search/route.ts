import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

// GET /api/search?q=jefferson — returns matching users + commissions
export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  if (!q) return NextResponse.json({ ok: true, users: [], commissions: [] });

  const session = await getSession();

  const [users, commissions] = await Promise.all([
    prisma.user.findMany({
      where: {
        OR: [
          { fullName: { contains: q, mode: "insensitive" as const } },
          { email: { contains: q, mode: "insensitive" as const } },
        ],
        // Exclude admins, banned accounts, and the searching user themselves.
        NOT: [
          { role: "ADMIN" },
          { status: "BANNED" },
          ...(session ? [{ id: session.userId }] : []),
        ],
      },
      select: {
        id: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        status: true,
      },
      take: 5,
    }),
    prisma.commission.findMany({
      where: {
        status: "OPEN",
        OR: [
          { title: { contains: q, mode: "insensitive" as const } },
          { description: { contains: q, mode: "insensitive" as const } },
          { subcategory: { contains: q, mode: "insensitive" as const } },
        ],
      },
      select: {
        id: true,
        title: true,
        category: true,
        subcategory: true,
        requiredLevel: true,
        fareMin: true,
        fareMax: true,
        fareUnit: true,
      },
      take: 6,
    }),
  ]);

  // Decorate users with a quick rating snapshot.
  const ratings = await Promise.all(
    users.map((u) =>
      prisma.rating.aggregate({
        where: { rateeId: u.id },
        _avg: { stars: true },
        _count: true,
      }).then((r) => ({ id: u.id, avg: r._avg.stars, count: r._count }))
    )
  );
  const ratingMap = new Map(ratings.map((r) => [r.id, r]));

  const usersWithRating = users.map((u) => {
    const r = ratingMap.get(u.id);
    return {
      ...u,
      ratingAvg: r?.avg ?? null,
      reviewCount: r?.count ?? 0,
    };
  });

  return NextResponse.json({ ok: true, users: usersWithRating, commissions });
}
