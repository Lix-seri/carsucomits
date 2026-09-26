import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { formatFare } from "@/lib/format";
import { assertAdmin, type Session } from "@/lib/session";
import type { TransactionFilter } from "./schemas";

// Transaction history (decision 0014): every hired commission, derived; no payments table.

export type Transaction = {
  id: string;
  title: string;
  date: Date;
  poster: { id: string; name: string };
  worker: { id: string; name: string };
  amount: string;
  amountMin: number;
  status: string;
};

async function load(where: Prisma.CommissionWhereInput, take = 200): Promise<Transaction[]> {
  const rows = await prisma.commission.findMany({
    where: { ...where, awardedToId: { not: null } },
    orderBy: { updatedAt: "desc" },
    take,
    include: {
      commissioner: { select: { id: true, fullName: true } },
      agreements: { select: { terms: true, acceptedAt: true }, orderBy: { acceptedAt: "desc" } },
    },
  });
  const workerIds = Array.from(new Set(rows.map((r) => r.awardedToId!)));
  const workers = new Map((await prisma.user.findMany({ where: { id: { in: workerIds } }, select: { id: true, fullName: true } })).map((u) => [u.id, u.fullName]));
  return rows.map((r) => {
    const agreed = r.agreements[0];
    return {
      id: r.id,
      title: r.title,
      // When the agreement was completed; older commissions fall back to their last change.
      date: agreed?.acceptedAt ?? r.updatedAt,
      poster: { id: r.commissioner.id, name: r.commissioner.fullName },
      worker: { id: r.awardedToId!, name: workers.get(r.awardedToId!) ?? "Former member" },
      amount: (agreed?.terms as { fare?: string } | undefined)?.fare ?? formatFare(r),
      amountMin: r.fareMin,
      status: r.status,
    };
  });
}

const totalCompleted = (rows: Transaction[]) => rows.filter((t) => t.status === "COMPLETED").reduce((n, t) => n + t.amountMin, 0);

/** The signed-in user's own history, as poster and as worker. Never anyone else's. */
export async function listMyTransactions(session: Session) {
  const transactions = await load({ OR: [{ commissionerId: session.userId }, { awardedToId: session.userId }] });
  return {
    transactions,
    paidFrom: totalCompleted(transactions.filter((t) => t.poster.id === session.userId)),
    earnedFrom: totalCompleted(transactions.filter((t) => t.worker.id === session.userId)),
  };
}

/** Admin: everyone's transactions, filtered by status, date range and a person's name or email. */
export async function listAllTransactions(session: Session, filter: TransactionFilter) {
  assertAdmin(session);
  const where: Prisma.CommissionWhereInput = {};
  if (filter.status) where.status = filter.status;
  if (filter.q) {
    const people = await prisma.user.findMany({
      where: { OR: [{ fullName: { contains: filter.q, mode: "insensitive" } }, { email: { contains: filter.q, mode: "insensitive" } }] },
      select: { id: true },
      take: 200,
    });
    const ids = people.map((p) => p.id);
    where.OR = [{ commissionerId: { in: ids } }, { awardedToId: { in: ids } }];
  }
  // The date shown is the agreement date, so filter on that. Days are campus (Manila) days.
  // ponytail: filtered in memory over the latest 500; move to SQL if the table grows past that.
  const from = filter.from ? new Date(`${filter.from}T00:00:00+08:00`) : null;
  const to = filter.to ? new Date(`${filter.to}T23:59:59.999+08:00`) : null;
  const transactions = (await load(where, 500)).filter((t) => (!from || t.date >= from) && (!to || t.date <= to));
  return { transactions, completedFrom: totalCompleted(transactions) };
}
