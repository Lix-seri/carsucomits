// Admin-only reads and actions. Every export checks the role itself, in addition to
// the /admin layout guard, so a new route or page can't forget it.
import { AccountStatus, CommissionStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { HttpError } from "@/lib/http";
import { assertAdmin, type Session } from "@/lib/session";

const USER_ACTIONS: Record<string, AccountStatus> = {
  WARN: AccountStatus.WARNED,
  SUSPEND: AccountStatus.SUSPENDED,
  BAN: AccountStatus.BANNED,
  REINSTATE: AccountStatus.ACTIVE,
};

export async function moderateUser(session: Session, userId: string, action: unknown) {
  assertAdmin(session);
  const status = typeof action === "string" ? USER_ACTIONS[action] : undefined;
  if (!status) throw new HttpError(400, "Invalid action.");

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) throw new HttpError(404, "User not found.");
  if (target.id === session.userId) throw new HttpError(400, "You can't moderate your own account.");
  if (target.role === "ADMIN" && action === "BAN") throw new HttpError(400, "Admin accounts cannot be banned via this action.");

  await prisma.user.update({ where: { id: userId }, data: { status } });
  await prisma.auditLog.create({
    data: { actorId: session.userId, action: String(action), target: userId, meta: JSON.stringify({ targetEmail: target.email, newStatus: status }) },
  });
  return { status };
}

async function avgRatings(ids: string[]) {
  const rows = await Promise.all(
    ids.map((id) => prisma.rating.aggregate({ where: { rateeId: id }, _avg: { stars: true } }).then((r) => [id, r._avg.stars] as const)),
  );
  return new Map(rows);
}

const OPEN_REPORT = { status: { in: ["PENDING", "UNDER_INVESTIGATION"] as ("PENDING" | "UNDER_INVESTIGATION")[] } };

/** Users with an open report against them, newest report first. */
async function flaggedUsers(take?: number) {
  const users = await prisma.user.findMany({
    where: { receivedReports: { some: OPEN_REPORT } },
    include: { receivedReports: { where: OPEN_REPORT, orderBy: { createdAt: "desc" }, take: 1 } },
    take,
  });
  return { flaggedUsers: users, avgMap: await avgRatings(users.map((u) => u.id)) };
}

const reportParties = { reporter: { select: { fullName: true } }, reportee: { select: { fullName: true } } };

export async function getAdminDashboard(session: Session) {
  assertAdmin(session);
  const [totalUsers, activeListings, pendingReports, flaggedAccounts, flagged, latestReports] = await Promise.all([
    prisma.user.count(),
    prisma.commission.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    prisma.report.count({ where: { status: "PENDING" } }),
    prisma.user.count({ where: { status: { in: ["WARNED", "SUSPENDED", "BANNED"] } } }),
    flaggedUsers(10),
    prisma.report.findMany({ where: { status: "PENDING" }, orderBy: { createdAt: "desc" }, include: reportParties, take: 10 }),
  ]);
  return { totalUsers, activeListings, pendingReports, flaggedAccounts, ...flagged, latestReports };
}

export async function getReportsOverview(session: Session) {
  assertAdmin(session);
  const [flagged, allReports] = await Promise.all([
    flaggedUsers(),
    prisma.report.findMany({ orderBy: { createdAt: "desc" }, include: reportParties, take: 50 }),
  ]);
  return { ...flagged, allReports };
}

export async function listUsers(session: Session, search: string) {
  assertAdmin(session);
  const contains = { contains: search, mode: "insensitive" as const };
  const users = await prisma.user.findMany({
    where: search ? { OR: [{ fullName: contains }, { email: contains }] } : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return { users, avgMap: await avgRatings(users.map((u) => u.id)) };
}

export async function listAllListings(session: Session, search: string, statusFilter?: string) {
  assertAdmin(session);
  const statuses = Object.values(CommissionStatus) as string[];
  const statusWhere = statusFilter && statuses.includes(statusFilter) ? { status: statusFilter as CommissionStatus } : {};
  const contains = { contains: search, mode: "insensitive" as const };
  const [listings, totals] = await Promise.all([
    prisma.commission.findMany({
      where: { ...statusWhere, ...(search ? { OR: [{ title: contains }, { description: contains }] } : {}) },
      orderBy: { createdAt: "desc" },
      include: { commissioner: { select: { fullName: true } }, _count: { select: { applications: true } } },
      take: 100,
    }),
    prisma.commission.groupBy({ by: ["status"], _count: true }),
  ]);
  return {
    listings,
    totalCount: totals.reduce((sum, t) => sum + t._count, 0),
    counts: Object.fromEntries(totals.map((t) => [t.status, t._count])) as Record<string, number>,
  };
}

/** Latest 200 audit entries, with target user names resolved where the target is a user id. */
export async function listAuditLogs(session: Session) {
  assertAdmin(session);
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { actor: { select: { fullName: true, email: true } } },
  });
  const targetIds = Array.from(new Set(logs.map((l) => l.target).filter(Boolean))) as string[];
  const targets = targetIds.length
    ? await prisma.user.findMany({ where: { id: { in: targetIds } }, select: { id: true, fullName: true } })
    : [];
  return { logs, targetMap: new Map(targets.map((u) => [u.id, u.fullName])) };
}

export async function getMfaStatus(session: Session) {
  assertAdmin(session);
  return prisma.user.findUnique({ where: { id: session.userId }, select: { mfaEnabled: true, email: true } });
}
