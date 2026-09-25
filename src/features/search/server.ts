import { prisma } from "@/lib/db";
import type { Session } from "@/lib/session";
import { ratingSummaries } from "@/features/ratings/server";

/** Topbar search: up to 5 users (not admins, not banned, not me) and 6 open commissions. */
export async function search(q: string, session: Session | null) {
  if (!q) return { users: [], commissions: [] };
  const contains = { contains: q, mode: "insensitive" as const };
  const [users, commissions] = await Promise.all([
    prisma.user.findMany({
      where: {
        OR: [{ fullName: contains }, { email: contains }],
        NOT: [{ role: "ADMIN" }, { status: "BANNED" }, ...(session ? [{ id: session.userId }] : [])],
      },
      select: { id: true, fullName: true, avatarUrl: true, role: true, status: true },
      take: 5,
    }),
    prisma.commission.findMany({
      where: { status: "OPEN", OR: [{ title: contains }, { description: contains }, { subcategory: contains }] },
      select: { id: true, title: true, category: true, subcategory: true, requiredLevel: true, fareMin: true, fareMax: true, fareUnit: true, coverImageUrl: true },
      take: 6,
    }),
  ]);
  const byId = await ratingSummaries(users.map((u) => u.id));
  return {
    users: users.map((u) => ({ ...u, ratingAvg: byId.get(u.id)?.avg ?? null, reviewCount: byId.get(u.id)?.count ?? 0 })),
    commissions,
  };
}
