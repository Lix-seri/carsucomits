// Read-only aggregations for the signed-in home screens: /dashboard, /hub, /commissioner.
import { prisma } from "@/lib/db";
import { LIVE_STATUSES, UNFINISHED_STATUSES } from "@/lib/labels";
import type { Session } from "@/lib/session";
import { getUserSkills, getUserStats } from "@/features/profile/server";
import { getMyListings } from "@/features/commissions/server";
import { listApplicantsForMe } from "@/features/applications/server";

async function namesById(ids: (string | null)[]) {
  const wanted = ids.filter((id): id is string => !!id);
  const users = wanted.length ? await prisma.user.findMany({ where: { id: { in: wanted } }, select: { id: true, fullName: true } }) : [];
  return new Map(users.map((u) => [u.id, u.fullName]));
}

export async function getDashboard(session: Session) {
  const me = session.userId;
  const [skills, stats, featured, doingTask, postedTask, inProgressCount, applicantsWaiting] = await Promise.all([
    getUserSkills(me),
    getUserStats(me),
    prisma.commission.findMany({
      where: { status: "OPEN", NOT: { commissionerId: me } },
      orderBy: { createdAt: "desc" },
      include: { commissioner: { select: { fullName: true } } },
      take: 3,
    }),
    prisma.commission.findFirst({
      where: { awardedToId: me, status: { in: [...UNFINISHED_STATUSES] } },
      include: { commissioner: { select: { fullName: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.commission.findFirst({
      where: { commissionerId: me, status: { in: [...LIVE_STATUSES] } },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { applications: true } } },
    }),
    prisma.commission.count({
      where: { OR: [{ awardedToId: me }, { commissionerId: me }], status: { in: [...UNFINISHED_STATUSES] } },
    }),
    prisma.application.count({ where: { commission: { commissionerId: me }, status: "PENDING" } }),
  ]);
  const awardedToName = postedTask?.awardedToId ? ((await namesById([postedTask.awardedToId])).get(postedTask.awardedToId) ?? "the student") : "the student";
  return { skills, stats, featured, doingTask, postedTask, inProgressCount, applicantsWaiting, awardedToName };
}

export async function getHub(session: Session) {
  const me = session.userId;
  const [doing, posted, applications, unratedCompleted, completedAsStudent] = await Promise.all([
    // Tasks I'm doing — commissions awarded to me
    prisma.commission.findMany({
      where: { awardedToId: me, status: { in: [...UNFINISHED_STATUSES] } },
      orderBy: { createdAt: "desc" },
      include: { commissioner: { select: { id: true, fullName: true } } },
    }),
    // Tasks I posted
    getMyListings(me),
    // My applications
    prisma.application.findMany({
      where: { applicantId: me },
      orderBy: { createdAt: "desc" },
      include: { commission: { select: { id: true, title: true, status: true } } },
      take: 20,
    }),
    // Commissions I posted that are COMPLETED but I never rated
    prisma.commission.findMany({
      where: { commissionerId: me, status: "COMPLETED", awardedToId: { not: null }, ratings: { none: { raterId: me } } },
    }),
    // Completed jobs I worked on where I haven't rated the commissioner
    prisma.commission.findMany({
      where: { awardedToId: me, status: "COMPLETED", ratings: { none: { raterId: me } } },
      include: { commissioner: { select: { id: true, fullName: true } } },
    }),
  ]);
  const awardedMap = await namesById([...posted.map((p) => p.awardedToId), ...unratedCompleted.map((p) => p.awardedToId)]);
  return { doing, posted, applications, unratedCompleted, completedAsStudent, awardedMap };
}

export async function getCommissionerHome(session: Session) {
  const me = session.userId;
  const [activeListings, totalApplicants, completedTasks, listings, pending] = await Promise.all([
    prisma.commission.count({ where: { commissionerId: me, status: { in: [...LIVE_STATUSES] } } }),
    prisma.application.count({ where: { commission: { commissionerId: me } } }),
    prisma.commission.count({ where: { commissionerId: me, status: "COMPLETED" } }),
    getMyListings(me, [...LIVE_STATUSES], 10),
    listApplicantsForMe(session, { pendingOnly: true, take: 10 }),
  ]);
  return { activeListings, totalApplicants, completedTasks, listings, recentApplicants: pending.applications, ratingMap: pending.avgRating, jobsMap: pending.activeJobs };
}
