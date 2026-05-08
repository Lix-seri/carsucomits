import { prisma } from "./db";

export async function getUserSkills(userId: string) {
  return prisma.skill.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
}

export async function getRatingDistribution(userId: string) {
  const groups = await prisma.rating.groupBy({
    by: ["stars"],
    where: { rateeId: userId },
    _count: true,
  });
  const byStar: Record<number, number> = {};
  for (const g of groups) byStar[g.stars] = g._count;
  return byStar;
}

export async function getUserStats(userId: string) {
  const [done, posted, ratingAgg, reviewCount, completedAsApplicant, totalAsApplicant] = await Promise.all([
    prisma.application.count({
      where: { applicantId: userId, status: "ACCEPTED", commission: { status: "COMPLETED" } },
    }),
    prisma.commission.count({ where: { commissionerId: userId } }),
    prisma.rating.aggregate({ where: { rateeId: userId }, _avg: { stars: true } }),
    prisma.rating.count({ where: { rateeId: userId } }),
    prisma.application.count({
      where: { applicantId: userId, status: "ACCEPTED", commission: { status: "COMPLETED" } },
    }),
    prisma.application.count({
      where: { applicantId: userId, status: { in: ["ACCEPTED", "REJECTED"] } },
    }),
  ]);

  const rating = ratingAgg._avg.stars ?? null;
  const successRate = totalAsApplicant > 0 ? Math.round((completedAsApplicant / totalAsApplicant) * 100) : null;

  return { done, posted, rating, reviewCount, successRate };
}

export async function getRecentReviews(userId: string, take = 3) {
  const reviews = await prisma.rating.findMany({
    where: { rateeId: userId },
    orderBy: { createdAt: "desc" },
    take,
    include: { rater: { select: { fullName: true } } },
  });
  return reviews.map((r) => ({
    who: r.rater.fullName,
    initials: r.rater.fullName.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase(),
    stars: r.stars,
    comment: r.comment,
    when: timeAgo(r.createdAt),
  }));
}

function timeAgo(d: Date) {
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  const intervals: [number, string][] = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.345, "week"],
    [12, "month"],
    [Infinity, "year"],
  ];
  let value = seconds;
  let unit = "second";
  for (const [div, name] of intervals) {
    if (value < div) { unit = name; break; }
    value = value / div;
    unit = name;
  }
  const v = Math.floor(value);
  return v <= 1 ? `just now` : `${v} ${unit}${v === 1 ? "" : "s"} ago`;
}
