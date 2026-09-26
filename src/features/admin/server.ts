// Admin-only reads and actions. Every export checks the role itself, in addition to
// the /admin layout guard, so a new route or page can't forget it.
import { AccountStatus, CommissionStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { LIVE_STATUSES } from "@/lib/labels";
import { audit } from "@/lib/audit";
import { HttpError } from "@/lib/http";
import { assertAdmin, type Session } from "@/lib/session";
import { averageRatings } from "@/features/ratings/server";
import { notify } from "@/features/notifications/server";

const USER_STATUSES = AccountStatus;

const USER_ACTIONS = {
  WARN: AccountStatus.WARNED,
  SUSPEND: AccountStatus.SUSPENDED,
  BAN: AccountStatus.BANNED,
  REINSTATE: AccountStatus.ACTIVE,
} as const;

/** Warn, suspend, ban or reinstate a student. Always with a reason, never on an admin account. */
export async function moderateUser(session: Session, userId: string, action: keyof typeof USER_ACTIONS, reason: string) {
  assertAdmin(session);
  const status = USER_ACTIONS[action];

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) throw new HttpError(404, "User not found.");
  if (target.id === session.userId) throw new HttpError(400, "You can't moderate your own account.");
  if (target.role === "ADMIN") throw new HttpError(400, "Admin accounts can't be moderated here.");

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { status } }),
    audit({ actorId: session.userId, action, target: userId, before: { status: target.status }, after: { status }, meta: { targetEmail: target.email, reason } }),
  ]);
  if (action === "WARN") {
    await notify({ userId, type: "ACCOUNT_FLAGGED", title: "You received a warning from an admin", body: reason });
  }
  return { status };
}

const OPEN_REPORT = { status: { in: ["PENDING", "UNDER_INVESTIGATION"] as ("PENDING" | "UNDER_INVESTIGATION")[] } };

/** Users with an open report against them, newest report first. */
async function flaggedUsers(take?: number) {
  const users = await prisma.user.findMany({
    where: { receivedReports: { some: OPEN_REPORT } },
    include: { receivedReports: { where: OPEN_REPORT, orderBy: { createdAt: "desc" }, take: 1 } },
    take,
  });
  return { flaggedUsers: users, avgMap: await averageRatings(users.map((u) => u.id)) };
}

const reportParties = { reporter: { select: { fullName: true } }, reportee: { select: { fullName: true } } };

export async function getAdminDashboard(session: Session) {
  assertAdmin(session);
  const [totalUsers, activeListings, pendingReports, flaggedAccounts, flagged, latestReports] = await Promise.all([
    prisma.user.count(),
    prisma.commission.count({ where: { status: { in: [...LIVE_STATUSES] } } }),
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

export async function listUsers(session: Session, search: string, status?: string) {
  assertAdmin(session);
  const contains = { contains: search, mode: "insensitive" as const };
  const byStatus = status && status in USER_STATUSES ? { status: status as AccountStatus } : {};
  const users = await prisma.user.findMany({
    where: { ...byStatus, ...(search ? { OR: [{ fullName: contains }, { email: contains }] } : {}) },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return { users, avgMap: await averageRatings(users.map((u) => u.id)) };
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
/** The latest 200 audit entries, optionally one kind of action, with target ids resolved to names. */
export async function listAuditLogs(session: Session, action?: string) {
  assertAdmin(session);
  const logs = await prisma.auditLog.findMany({
    where: action ? { action } : {},
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { actor: { select: { fullName: true, email: true } } },
  });
  const ids = Array.from(new Set(logs.map((l) => l.target).filter(Boolean))) as string[];
  const [users, commissions, actions] = await Promise.all([
    prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true, fullName: true } }),
    prisma.commission.findMany({ where: { id: { in: ids } }, select: { id: true, title: true } }),
    prisma.auditLog.findMany({ distinct: ["action"], select: { action: true }, orderBy: { action: "asc" } }),
  ]);
  const targetMap = new Map<string, string>([...users.map((u) => [u.id, u.fullName] as const), ...commissions.map((c) => [c.id, `"${c.title}"`] as const)]);
  return { logs, targetMap, actions: actions.map((a) => a.action) };
}

export async function getMfaStatus(session: Session) {
  assertAdmin(session);
  return prisma.user.findUnique({ where: { id: session.userId }, select: { mfaEnabled: true, email: true } });
}

/** Admin only: make a student a USED officer, or back. Audit-logged with before and after. */
export async function setUserRole(session: Session, userId: string, role: "STUDENT_EMPLOYEE" | "USED") {
  assertAdmin(session);
  const target = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!target) throw new HttpError(404, "User not found.");
  if (target.role === "ADMIN") throw new HttpError(400, "Admin roles can't be changed here.");
  if (target.role === role) return { role };
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { role } }),
    audit({ actorId: session.userId, action: "ROLE_CHANGED", target: userId, before: { role: target.role }, after: { role } }),
  ]);
  return { role };
}
